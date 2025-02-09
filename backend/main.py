import os
import uuid
import asyncio
import logging
from typing import Dict
from dotenv import load_dotenv
from openai import AsyncOpenAI
from fastapi import FastAPI, WebSocket, HTTPException, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from playwright.async_api import async_playwright, Playwright, Browser, Page

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AIWebBrowser:
    def __init__(self):
        self.playwright: Playwright | None = None
        self.browser: Browser | None = None
        self.sessions: Dict[str, Dict] = {}
        self._initialization_lock = asyncio.Lock()
        self._initialized = False

    async def ensure_initialized(self):
        """Ensure browser is initialized"""
        if not self._initialized:
            async with self._initialization_lock:
                if not self._initialized:  # Double-check pattern
                    try:
                        self.playwright = await async_playwright().start()
                        self.browser = await self.playwright.chromium.launch(
                            headless=True,
                            args=["--no-sandbox", "--disable-setuid-sandbox"],
                        )
                        self._initialized = True
                        logger.info("Browser initialized successfully")
                    except Exception as e:
                        logger.error(f"Failed to initialize browser: {e}")
                        raise RuntimeError(f"Browser initialization failed: {e}")

    async def create_browser_session(self) -> Dict:
        """Create a new browser session"""
        try:
            await self.ensure_initialized()

            context = await self.browser.new_context(
                viewport={"width": 1280, "height": 720}
            )
            page = await context.new_page()
            session_id = str(uuid.uuid4())

            self.sessions[session_id] = {"page": page, "context": context}

            logger.info(f"Created new session: {session_id}")
            return {"session_id": session_id}

        except Exception as e:
            logger.error(f"Failed to create browser session: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to create browser session: {str(e)}"
            )

    async def cleanup_session(self, session_id: str):
        """Clean up a specific session"""
        if session_id in self.sessions:
            try:
                session = self.sessions[session_id]
                await session["page"].close()
                await session["context"].close()
                del self.sessions[session_id]
                logger.info(f"Cleaned up session: {session_id}")
            except Exception as e:
                logger.error(f"Error cleaning up session {session_id}: {e}")

    async def cleanup(self):
        """Cleanup all browser resources"""
        try:
            for session_id in list(self.sessions.keys()):
                await self.cleanup_session(session_id)

            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()

            self._initialized = False
            logger.info("Browser cleanup completed")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Web Browser
ai_browser = AIWebBrowser()


@app.on_event("startup")
async def startup_event():
    try:
        await ai_browser.ensure_initialized()
    except Exception as e:
        logger.error(f"Startup failed: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    await ai_browser.cleanup()


@app.post("/api/start-session")
async def start_session():
    """Start a new browser session"""
    try:
        result = await ai_browser.create_browser_session()
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Failed to start session: {e}")
        return JSONResponse(
            status_code=500, content={"error": f"Failed to start session: {str(e)}"}
        )


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    try:
        await websocket.accept()

        if session_id not in ai_browser.sessions:
            await websocket.close(code=4000, reason="Invalid session")
            return

        session = ai_browser.sessions[session_id]
        page = session["page"]

        while True:
            try:
                data = await websocket.receive_json()
                action_type = data.get("type")
                details = data.get("details", {})

                if action_type == "navigate":
                    await page.goto(details["url"])
                elif action_type == "click":
                    if "selector" in details:
                        await page.click(details["selector"])
                    else:
                        await page.mouse.click(details["x"], details["y"])
                elif action_type == "type":
                    if "selector" in details:
                        await page.type(details["selector"], details["text"])
                    else:
                        await page.keyboard.type(details["text"])
                elif action_type == "keypress":
                    await page.keyboard.press(details["key"])

                screenshot = await page.screenshot(type="jpeg", quality=70)
                await websocket.send_bytes(screenshot)

            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await websocket.send_json({"error": str(e)})

    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
    finally:
        await ai_browser.cleanup_session(session_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

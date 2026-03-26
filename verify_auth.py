from playwright.sync_api import sync_playwright

def test_redirect_to_login():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="/home/jules/verification/video")
        page = context.new_page()

        # Try to access dashboard directly. The API interceptor will fail to refresh
        # because the backend is not even connected/running properly, so the
        # frontend interceptor we changed should catch the failure and redirect to /login.
        try:
            page.goto("http://localhost:5173/")
            page.wait_for_timeout(2000)

            # verify we end up on the login page due to our api.ts change
            page.screenshot(path="/home/jules/verification/verification.png")
            page.wait_for_timeout(1000)
            print("Current URL:", page.url)
            assert "login" in page.url or "signin" in page.url, "Should redirect to login page when auth fails"

        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    import os
    os.makedirs("/home/jules/verification/video", exist_ok=True)
    test_redirect_to_login()

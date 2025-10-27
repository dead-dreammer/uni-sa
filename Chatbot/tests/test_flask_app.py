from playwright.sync_api import sync_playwright
import pytest
import time

#To run application: pytest test_flask_app.py -v -s
BASE_URL = "http://localhost:5000"

#Pages to check - Updated with correct routes and unique expected content
PAGES = [
    ("/", ["UNI.SA", "University Matchmakers", "Match, Apply, Achieve"]),
    ("/about", ["Who We Are", "Our Mission & Vision"]),
    ("/how-it-works", ["Your Path to University Success", "Smart Matching"]),
    ("/contact", ["Send Us a Message", "Contact Information"]),
    ("/login", ["Welcome Back", "Not a member?"]),
    ("/admissions", ["Admissions Calendar", "Placeholder admissions"]),
    ("/bursaries", ["Bursaries", "Placeholder bursaries"]),
    ("/start-search", ["Dashboard", "Personal Information and Preferences", "Matched Universities"]),
    ("/personal-info", ["START YOUR SEARCH", "Find Your Perfect University Match", "Answer a few questions"]),
]

@pytest.mark.parametrize("path,expected_texts", PAGES)
def test_page_loads(path, expected_texts):
    """Test that each main page loads and displays expected text"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            page.goto(f"{BASE_URL}{path}", wait_until="networkidle", timeout=10000)
            
            # Check at least one expected text is visible (use more specific selectors)
            found = False
            for txt in expected_texts:
                try:
                    # Use contains text and get first match to avoid strict mode errors
                    element = page.get_by_text(txt, exact=False).first
                    if element.is_visible(timeout=3000):
                        found = True
                        print(f"✅ Found '{txt}' on {path}")
                        break
                except Exception as inner_e:
                    print(f"⚠️ Could not find '{txt}': {inner_e}")
                    continue
            
            if not found:
                # Take screenshot before assertion
                screenshot_name = f"error_{path.replace('/', '_')}.png"
                page.screenshot(path=screenshot_name)
                pytest.fail(f"None of {expected_texts} were found on {path}")
            
        except Exception as e:
            screenshot_name = f"error_{path.replace('/', '_')}.png"
            try:
                page.screenshot(path=screenshot_name)
            except:
                pass
            pytest.fail(f"Failed to load {path}: {e}")
        finally:
            browser.close()


def test_chatbot_interaction():
    """Test opening and interacting with the chatbot (NOT in iframe)"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()
        
        try:
            # Navigate to home page
            page.goto(BASE_URL, wait_until="networkidle", timeout=10000)
            print("✅ Page loaded")
            
            # Step 1: Wait for chat button to be visible
            chat_button = page.locator("#chatButton")
            chat_button.wait_for(state="visible", timeout=10000)
            print("Chat button found")
            
            #Step 2: Click to open chatbot
            chat_button.click()
            time.sleep(0.5)  # Give animation time to complete
            print("Clicked chat button")
            
            #Step 3: Wait for chat widget to be visible
            chat_widget = page.locator("#chatWidget")
            assert chat_widget.is_visible(), "Chat widget did not open"
            print("Chat widget opened")
            
            #Step 4: Wait for input field to be visible
            user_input = page.locator("#userInput")
            user_input.wait_for(state="visible", timeout=5000)
            print("Input field found")
            
            #Step 5: Type message
            message = "What courses do you offer?"
            user_input.fill(message)
            print(f"Typed message: {message}")
            
            # Step 6: Click send button
            send_button = page.locator("#sendButton")
            send_button.click()
            print("Clicked send button")
            
            # Step 7: Wait for user message to appear
            time.sleep(1)
            user_messages = page.locator(".message.user")
            assert user_messages.count() > 0, "User message not displayed"
            print("User message displayed")
            
            # Step 8: Wait for bot reply (with typing indicator)
            # First wait for typing indicator
            typing_indicator = page.locator("#typingIndicator")
            if typing_indicator.is_visible():
                print("Typing indicator showing")
            
            # Wait for bot message (max 15 seconds for API response)
            bot_message = page.locator(".message.bot").last
            bot_message.wait_for(state="visible", timeout=15000)
            
            # Get the reply text
            reply_text = bot_message.locator(".message-content p").inner_text()
            assert reply_text.strip() != "", "❌ Chatbot gave empty reply"
            print(f"✅ Chatbot replied: {reply_text[:100]}...")
            
            # ✅ Step 9: Test closing chatbot
            close_button = page.locator("#closeChat")
            close_button.click()
            time.sleep(0.5)
            
            # Check if widget is hidden
            assert not chat_widget.is_visible(), "❌ Chat widget did not close"
            print("✅ Chat widget closed successfully")
            
        except Exception as e:
            page.screenshot(path="chatbot_test_error.png")
            pytest.fail(f"❌ Chatbot test failed: {e}")
        finally:
            browser.close()


def test_login_form_validation():
    """Test login form validation"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            page.goto(f"{BASE_URL}/login", wait_until="networkidle")
            
            # ✅ Ensure login form is visible
            login_form = page.locator("#loginFormElement")
            assert login_form.is_visible(), "❌ Login form not visible"
            
            # ✅ Try to submit empty form (should show validation)
            submit_button = page.locator("#loginFormElement button[type='submit']")
            submit_button.click()
            
            # Check if HTML5 validation prevents submission
            email_input = page.locator("#loginEmail")
            is_valid = email_input.evaluate("el => el.validity.valid")
            assert not is_valid, "❌ Form accepted empty email"
            print("✅ Login form validation working")
            
        except Exception as e:
            page.screenshot(path="login_test_error.png")
            pytest.fail(f"❌ Login test failed: {e}")
        finally:
            browser.close()


def test_navigation_links():
    """Test that main navigation links work"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            page.goto(BASE_URL, wait_until="networkidle")
            
            # Test "About Us" link
            about_link = page.locator("nav a[href*='about']").first
            about_link.click()
            page.wait_for_url("**/about", timeout=5000)
            assert "about" in page.url, "❌ About page not loaded"
            print("✅ About Us navigation working")
            
            # Go back home
            page.goto(BASE_URL, wait_until="networkidle")
            
            # Test "How it Works" link
            how_link = page.locator("nav a[href*='how-it-works']").first
            how_link.click()
            page.wait_for_url("**/how-it-works", timeout=5000)
            assert "how-it-works" in page.url, "❌ How it Works page not loaded"
            print("✅ How it Works navigation working")
            
        except Exception as e:
            page.screenshot(path="navigation_test_error.png")
            pytest.fail(f"❌ Navigation test failed: {e}")
        finally:
            browser.close()


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "-s"])
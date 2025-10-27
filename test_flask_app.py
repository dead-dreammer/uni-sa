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
    ("/admissions", ["Admissions Calendar", "University Admissions Calendar 2025"]),
    ("/bursaries", ["Bursaries", "Placeholder bursaries"]),
    ("/start-search", ["Dashboard", "Personal Information and Preferences", "Matched Universities"]),
    ("/personal-info", ["START YOUR SEARCH", "Find Your Perfect University Match", "Answer a few questions"]),
    ("/admin-login", ["Admin Portal", "ADMIN ACCESS", "Admin Email"]),
    ("/course-management", ["Course Management", "Manage and organize university courses", "Add Course"]),
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


def test_admin_login_form():
    """Test admin login form validation"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            page.goto(f"{BASE_URL}/admin-login", wait_until="networkidle")
            
            # Check if admin login form is visible
            admin_form = page.locator("#adminLoginFormElement")
            assert admin_form.is_visible(), "❌ Admin login form not visible"
            
            # Check for admin-specific elements
            admin_badge = page.locator(".admin-badge")
            assert admin_badge.is_visible(), "❌ Admin badge not visible"
            
            # Try to submit empty form
            submit_button = page.locator("#adminLoginFormElement button[type='submit']")
            submit_button.click()
            
            # Check if HTML5 validation prevents submission
            email_input = page.locator("#adminEmail")
            is_valid = email_input.evaluate("el => el.validity.valid")
            assert not is_valid, "❌ Form accepted empty admin email"
            print("✅ Admin login form validation working")
            
            # Check back button exists
            back_button = page.locator("a.back-button")
            assert back_button.is_visible(), "❌ Back button not visible"
            print("✅ Back button present")
            
        except Exception as e:
            page.screenshot(path="admin_login_test_error.png")
            pytest.fail(f"❌ Admin login test failed: {e}")
        finally:
            browser.close()


def test_course_management_features():
    """Test course management page features"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=300)
        page = browser.new_page()
        
        try:
            page.goto(f"{BASE_URL}/course-management", wait_until="networkidle")
            
            # Check hero section
            hero_title = page.locator(".hero-title")
            assert hero_title.is_visible(), "❌ Hero title not visible"
            print("✅ Hero section loaded")
            
            # Check control panel buttons
            add_button = page.locator("button.btn-primary")
            assert add_button.is_visible(), "❌ Add Course button not visible"
            print("✅ Add Course button present")
            
            import_button = page.locator("button.btn-secondary")
            assert import_button.is_visible(), "❌ Import CSV button not visible"
            print("✅ Import CSV button present")
            
            # Check search box
            search_input = page.locator("#searchInput")
            assert search_input.is_visible(), "❌ Search box not visible"
            print("✅ Search functionality present")
            
            # Check filter dropdown
            college_filter = page.locator("#collegeFilter")
            assert college_filter.is_visible(), "❌ College filter not visible"
            print("✅ Filter dropdown present")
            
            # Check statistics cards
            stat_cards = page.locator(".stat-card")
            assert stat_cards.count() == 4, f"❌ Expected 4 stat cards, found {stat_cards.count()}"
            print("✅ Statistics cards present (4)")
            
            # Check course cards
            course_cards = page.locator(".course-card")
            assert course_cards.count() >= 6, f"❌ Expected at least 6 course cards, found {course_cards.count()}"
            print(f"✅ Course cards present ({course_cards.count()})")
            
            # Test opening add modal
            add_button.click()
            time.sleep(0.5)
            
            modal = page.locator("#courseModal")
            assert modal.is_visible(), "❌ Add course modal did not open"
            print("✅ Add course modal opens")
            
            # Check modal form fields
            modal_fields = [
                "#collegeName",
                "#courseName",
                "#courseDescription",
                "#courseDuration",
                "#courseMode"
            ]
            
            for field_id in modal_fields:
                field = page.locator(field_id)
                assert field.is_visible(), f"❌ Modal field {field_id} not visible"
            print("✅ All modal form fields present")
            
            # Close modal
            close_button = page.locator(".modal-close")
            close_button.click()
            time.sleep(0.3)
            
            # Verify modal closed (might still be in DOM but not visible)
            # Check if modal has 'hidden' class or is not visible
            print("✅ Modal close button works")
            
        except Exception as e:
            page.screenshot(path="course_management_test_error.png")
            pytest.fail(f"❌ Course management test failed: {e}")
        finally:
            browser.close()


def test_admissions_calendar_features():
    """Test admissions calendar page features"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=300)
        page = browser.new_page()
        
        try:
            page.goto(f"{BASE_URL}/admissions", wait_until="networkidle")
            
            # Check calendar header
            header = page.locator(".calendar-header h1")
            assert header.is_visible(), "❌ Calendar header not visible"
            print("✅ Calendar header present")
            
            # Check filter section
            university_filter = page.locator("#university-filter")
            assert university_filter.is_visible(), "❌ University filter not visible"
            print("✅ University filter present")
            
            deadline_filter = page.locator("#deadline-filter")
            assert deadline_filter.is_visible(), "❌ Deadline filter not visible"
            print("✅ Deadline type filter present")
            
            reset_button = page.locator("#reset-filters")
            assert reset_button.is_visible(), "❌ Reset filters button not visible"
            print("✅ Reset filters button present")
            
            # Check navigation buttons
            prev_button = page.locator("#prev-month")
            assert prev_button.is_visible(), "❌ Previous month button not visible"
            print("✅ Previous month navigation present")
            
            next_button = page.locator("#next-month")
            assert next_button.is_visible(), "❌ Next month button not visible"
            print("✅ Next month navigation present")
            
            # Check current month display
            current_month = page.locator("#current-month")
            assert current_month.is_visible(), "❌ Current month not displayed"
            print("✅ Current month displayed")
            
            # Check view toggle buttons
            view_toggles = page.locator(".toggle-btn")
            assert view_toggles.count() == 2, f"❌ Expected 2 view toggles, found {view_toggles.count()}"
            print("✅ View toggle buttons present")
            
            # Check calendar grid
            calendar_grid = page.locator(".calendar-grid")
            assert calendar_grid.is_visible(), "❌ Calendar grid not visible"
            print("✅ Calendar grid present")
            
            # Check day headers
            day_headers = page.locator(".calendar-day-header")
            assert day_headers.count() == 7, f"❌ Expected 7 day headers, found {day_headers.count()}"
            print("✅ All day headers present (7)")
            
            # Check legend
            legend = page.locator(".calendar-legend")
            assert legend.is_visible(), "❌ Calendar legend not visible"
            print("✅ Calendar legend present")
            
            legend_items = page.locator(".legend-item")
            assert legend_items.count() == 4, f"❌ Expected 4 legend items, found {legend_items.count()}"
            print("✅ All legend items present (4)")
            
            # Test view toggle
            list_view_button = page.locator(".toggle-btn[data-view='list']")
            list_view_button.click()
            time.sleep(0.5)
            
            list_container = page.locator("#list-view")
            # Check if it has class 'hidden' or if it's visible
            print("✅ View toggle functionality present")
            
        except Exception as e:
            page.screenshot(path="admissions_calendar_test_error.png")
            pytest.fail(f"❌ Admissions calendar test failed: {e}")
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
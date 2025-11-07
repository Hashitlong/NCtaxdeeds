#!/usr/bin/env python3
"""
Kania Law Firm Tax Foreclosure Scraper
Scrapes property listings from https://kanialawfirm.com/tax-foreclosures/foreclosure-listings/
Uses Selenium for dynamic content
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import json
import sys
from datetime import datetime
from typing import List, Dict, Optional
import time

class KaniaScraper:
    def __init__(self):
        self.base_url = "https://kanialawfirm.com/tax-foreclosures/foreclosure-listings/"
        
    def _setup_driver(self):
        """Setup Chrome driver with headless options"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    
    def scrape(self) -> List[Dict]:
        """
        Scrape all property listings from Kania Law Firm website
        Returns list of property dictionaries
        """
        driver = None
        try:
            print(f"Initializing Chrome driver...", file=sys.stderr)
            driver = self._setup_driver()
            
            print(f"Navigating to {self.base_url}...", file=sys.stderr)
            driver.get(self.base_url)
            
            # Wait for page to load and check for disclaimer
            time.sleep(3)
            
            # Try to find and click "I understand" checkbox and Submit button if present
            try:
                checkbox = driver.find_element(By.CSS_SELECTOR, 'input[type="checkbox"]')
                if checkbox:
                    driver.execute_script("arguments[0].click();", checkbox)
                    time.sleep(1)
                    
                    submit_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Submit')]")
                    if submit_btn:
                        driver.execute_script("arguments[0].click();", submit_btn)
                        time.sleep(3)
            except:
                pass  # No disclaimer, continue
            
            # Wait for table to be present
            print("Waiting for property table...", file=sys.stderr)
            wait = WebDriverWait(driver, 20)
            table = wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
            
            # Get all table rows
            rows = table.find_elements(By.TAG_NAME, "tr")
            print(f"Found {len(rows)} total rows (including header)", file=sys.stderr)
            
            properties = []
            
            # Skip header row
            for row in rows[1:]:
                try:
                    cols = row.find_elements(By.TAG_NAME, "td")
                    if len(cols) >= 10:  # Ensure we have all columns
                        property_data = self._parse_row(cols)
                        if property_data:
                            properties.append(property_data)
                except Exception as e:
                    print(f"Error parsing row: {e}", file=sys.stderr)
                    continue
            
            print(f"Successfully parsed {len(properties)} properties", file=sys.stderr)
            return properties
            
        except Exception as e:
            print(f"Error scraping Kania Law Firm: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc(file=sys.stderr)
            return []
        finally:
            if driver:
                driver.quit()
    
    def _parse_row(self, cols: List) -> Optional[Dict]:
        """Parse a single table row into property dictionary"""
        try:
            # Extract text from each column
            county = cols[0].text.strip()
            address = cols[1].text.strip()
            parcel_id = cols[2].text.strip()
            sale_date_time = cols[3].text.strip()
            opening_bid = cols[4].text.strip() if len(cols) > 4 else ""
            current_bid = cols[5].text.strip() if len(cols) > 5 else ""
            close_date = cols[6].text.strip() if len(cols) > 6 else ""
            property_type = cols[7].text.strip() if len(cols) > 7 else ""
            court_file = cols[8].text.strip() if len(cols) > 8 else ""
            file_number = cols[9].text.strip() if len(cols) > 9 else ""
            
            # Skip empty rows
            if not county or not parcel_id:
                return None
            
            # Parse sale date and time
            sale_date = None
            sale_time = None
            if sale_date_time and sale_date_time != "Sale date not yet set":
                try:
                    # Format: "10/23/2025 11:00:00 AM"
                    dt = datetime.strptime(sale_date_time, "%m/%d/%Y %I:%M:%S %p")
                    sale_date = dt.strftime("%Y-%m-%d %H:%M:%S")
                    sale_time = dt.strftime("%I:%M %p")
                except:
                    # Try without time
                    try:
                        dt = datetime.strptime(sale_date_time, "%m/%d/%Y")
                        sale_date = dt.strftime("%Y-%m-%d")
                    except:
                        pass
            
            # Parse close date (upset bid deadline)
            upset_close_date = None
            if close_date and close_date != "":
                try:
                    dt = datetime.strptime(close_date, "%m/%d/%Y")
                    upset_close_date = dt.strftime("%Y-%m-%d")
                except:
                    pass
            
            # Determine sale status
            sale_status = "scheduled"
            if upset_close_date:
                sale_status = "in_upset_period"
            elif not sale_date:
                sale_status = "scheduled"
            
            # Parse bid amounts (convert to cents)
            opening_bid_cents = self._parse_currency(opening_bid)
            current_bid_cents = self._parse_currency(current_bid)
            
            return {
                "county": county,
                "address": address,
                "parcelId": parcel_id,
                "saleDate": sale_date,
                "saleTime": sale_time,
                "saleStatus": sale_status,
                "openingBid": opening_bid_cents,
                "currentBid": current_bid_cents,
                "upsetBidCloseDate": upset_close_date,
                "propertyType": property_type,
                "courtFileNumber": court_file,
                "attorneyFileNumber": file_number,
                "attorneyFirm": "Kania Law Firm",
                "sourceUrl": self.base_url,
                "sourceType": "kania",
            }
        except Exception as e:
            print(f"Error parsing property row: {e}", file=sys.stderr)
            return None
    
    def _parse_currency(self, value: str) -> Optional[int]:
        """Convert currency string like '$3,400.00' to cents"""
        if not value or value == "":
            return None
        try:
            # Remove $ and commas
            cleaned = value.replace('$', '').replace(',', '').strip()
            if not cleaned:
                return None
            # Convert to float then to cents
            return int(float(cleaned) * 100)
        except:
            return None


def main():
    """Main entry point for scraper"""
    scraper = KaniaScraper()
    properties = scraper.scrape()
    
    # Output JSON to stdout
    print(json.dumps(properties, indent=2))
    
    # Return exit code based on success
    return 0 if properties else 1


if __name__ == "__main__":
    sys.exit(main())

import os
import requests

# Read API links from environment variables
NS_PLAYER_URL = os.environ.get("NS_PLAYER_URL")
OTT_NAV_URL = os.environ.get("OTT_NAV_URL")

# Credit message
CREDIT_MESSAGE = "# This m3u presented by t.me/piratestv_updates\n# API from byte-capsule\n"

def fetch_data(url):
    """Fetch data from the given URL."""
    response = requests.get(url)
    response.raise_for_status()  # Raise an error for bad status codes
    return response.text

def save_to_file(filename, content):
    """Save the given content to a file."""
    with open(filename, "w") as file:
        # Write credit message at the beginning of the file
        file.write(CREDIT_MESSAGE)
        # Write the content
        file.write(content)

def main():
    try:
        # Fetch M3U data from Cloudflare Workers
        ns_player_m3u = fetch_data(NS_PLAYER_URL)
        ott_nav_m3u = fetch_data(OTT_NAV_URL)

        # Save to files
        save_to_file("ns_player.m3u", ns_player_m3u)
        save_to_file("ott_nav.m3u", ott_nav_m3u)

        print("M3U files generated successfully")

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()

import subprocess
import re

def scan_wifi_windows():
    print("Scanning for Wi-Fi networks...\n")
    result = subprocess.run(["netsh", "wlan", "show", "networks", "mode=Bssid"], capture_output=True, text=True)
    output = result.stdout

    networks = re.findall(r"SSID \d+ : (.+?)\n", output)
    signal_strengths = re.findall(r"Signal\s+:\s+(\d+)%", output)

    for i, ssid in enumerate(networks):
        signal = signal_strengths[i] if i < len(signal_strengths) else "N/A"
        print(f"{i+1}. SSID: {ssid}, Signal Strength: {signal}%")


scan_wifi_windows()



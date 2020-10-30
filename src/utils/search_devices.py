import sys
from yeelight import *

results = discover_bulbs()

if len(results) > 0:
    ip = results[0]['ip']
    print(ip)
    sys.stdout.flush()

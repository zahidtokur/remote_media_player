import sys
import time
import requests
import threading
from yeelight import *


def chunks(lst, n):
    partitioned = []
    for i in range(0, len(lst), n):
        partitioned.append(lst[i:i + n])

    return partitioned


def main(arg, filename):
    ## Choose video
    file_ = open('src/utils/colors/' + arg + '.txt', 'r') 
    
    ## Read values from txt
    lines = file_.readlines()
    colors = []
    for line in lines: 
        r, g, b = line.strip().split(',')
        colors.append({
            'r': r.strip(),
            'g': g.strip(),
            'b': b.strip(),
        })

    ## Create transitions at length=8
    partitioned = chunks(colors, 8)
    transitions_list = []
    for p in partitioned:
        transitions = []
        for obj in p:
            transitions.append(RGBTransition(int(obj['r']), int(obj['g']), int(obj['b']), duration=500, brightness=50))
        transitions_list.append(transitions)
    

    ## Start flows inside loop and set sleep timers
    # for i in range(5):
    #     print(5 - i , ' saniye içinde başlıyor...')
    #     time.sleep(1)

    # defining the api-endpoint
    URL = "http://192.168.88.42:3000/startSlide/"

    # data to be sent to api
    data = {'filename': filename}

    # sending post request and saving response as response object

    flow = Flow(
        count=0,
        transitions=transitions_list[0]
    )
    bulb.start_flow(flow)

    time.sleep(0.2)
    r = requests.post(url=URL, data=data)
    time.sleep(0.5*len(transitions) - 0.2)

    for transitions in transitions_list[1:]:
        flow = Flow(
            count=0,
            transitions=transitions
        )
        bulb.start_flow(flow)
        time.sleep(0.5*len(transitions))

if __name__ == "__main__":
    ip = sys.argv[1].strip()
    color = sys.argv[2]
    filename = sys.argv[3]
    bulb = Bulb(ip)
    bulb.turn_on()
    main(color, filename)

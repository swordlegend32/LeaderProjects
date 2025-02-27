import time
import threading
from LinkedList import *

class TaskHandler():

    def __init__(self,ticks_per_seccond = 30):
        self.Tick = 0
        self.ticks_per_seccond = ticks_per_seccond
        self.start_time = time.time()
        self.Tasks = {}

    def loop(self):
        while True:
            self.Tick += 1

            if self.Tick in self.Tasks:
                for List in self.Tasks[self.Tick]:
                    threading.Thread(target=List[0],args=List[1]).start()
                    
            
            self.Tasks[self.Tick] = None

            time.sleep(1/self.ticks_per_seccond)
    
    def delay(self,Function,args,Delay):
        Tick = self.Tick
        if not Tick + Delay in self.Tasks:
            self.Tasks[Tick  + Delay] = [(Function,args)]
            return
        self.Tasks[Tick + Delay].append((Function,args))

    def start(self):
        self.loop()

Task = TaskHandler()
threading.Thread(target=Task.start,args=()).start()

# def test():
#     print("Hello World")  
#     time.sleep(999999)

# Task.delay(test,(),5 * Task.ticks_per_seccond)
# Task.delay(test,(),6 * Task.ticks_per_seccond)
# Task.delay(test,(),7 * Task.ticks_per_seccond) 

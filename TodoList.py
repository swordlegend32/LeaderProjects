from LinkedList import *
from TaskHandler import *


class TODOList():

    def __init__(self):
        self.Todo = LinkedList([],doubly_linked=True, circular=False)

    def add(self, task):
        self.Todo.insert_back(Node([task, False]))

    def check(self, task):
        node = self.Todo.get_node_from_value([task,False])
        if not node: node = self.Todo.get_node_from_value([task,True])
        if node: node.value[1] = not node.value[1]
    
    def remove(self, task):
        node = self.Todo.get_node_from_value([task,False])
        if not node: node = self.Todo.get_node_from_value([task,True])
        if node: self.Todo.remove(node)
    
    def __str__(self):
        if self.Todo.first is None or self.Todo.last is None: return "No tasks"
        current = self.Todo.first
        start = self.Todo.first
        List = [f"Task: {current.value[0]} Checked off: {"Yes" if current.value[1] else "No"}"]
        while current.next and current.next != start:
            current = current.next
            List.append(f"Task: {current.value[0]}, Checked off: {"Yes" if current.value[1] else "No"}")
        return f"Tasks: \n {'\n '.join(List)}"
    
TodoList = TODOList()
Task = TaskHandler(ticks_per_seccond=1)

def start():
    Task_coroutine = task_coroutine()
    Check_corountine = check_coroutine()
    Remove_coroutine = remove_coroutine()

    Task_coroutine.__next__()
    Check_corountine.__next__()
    Remove_coroutine.__next__()

    while True:
        print("Enter Task name: [r (remove), a or i (insert/add),c (check),s or v (see or visualize to print the entire code)] followed by a space and the task name")
        Task = input("Enter your Task: ")
        if Task.startswith('r '):
            Remove_coroutine.send(Task[2:])
        elif Task.startswith('a ') or Task.startswith('i '):
            Task_coroutine.send(Task[2:])
        elif Task.startswith('c '):
            Check_corountine.send(Task[2:])
        elif Task.startswith('s ') or Task.startswith('v '):
            print(TodoList)
        print("")


def task_coroutine():
    while True:
        task = (yield)
        Task.delay(TodoList.remove,(task,),120)
        TodoList.add(task)
       

def check_coroutine():
    while True:
        task = (yield)
        TodoList.check(task)

def remove_coroutine():
    while True:
        task = (yield)
        TodoList.remove(task)

threading.Thread(target=start,args=()).start()
threading.Thread(target=Task.start(),args=()).start()
class Node():

    def __init__(self,value):
        self.value = value

    def __str__(self):
        return f"value: {self.value}, next: {self.next.value}, previous: {self.previous.value}"
    

class LinkedList():
    def __init__(self,Nodes : list):
        self.Nodes = Nodes
        self.First = Nodes[0]
        self.Last = Nodes[-1]

        for i in range(len(Nodes)):
            if i > 0:
                Nodes[i].previous = Nodes[i - 1]
            if i < len(Nodes) - 1:
                Nodes[i].next = Nodes[i + 1]

    def InsertBack(self,Node : Node):
        Node.previous = self.Last
        Node.next = self.First
        self.Last.next = Node
        self.Last = Node
        self.Nodes.append(Node)

    def InsertFront(self,Node: Node):
        Node.previous = self.Last
        Node.next = self.First
        self.First.previous = Node
        self.First = Node
        self.Nodes.insert(0,Node)

    def GetNodeFromValue(self,value):
        Start = self.First
        while Start.value != value:
            Start = Start.next
        return Start


Nodes = [Node(1),Node(5),Node(7)]
LinkedL = LinkedList(Nodes)

LinkedL.InsertFront(Node(9))
LinkedL.InsertBack(Node("Wow"))

print(LinkedL.GetNodeFromValue("Wow"))



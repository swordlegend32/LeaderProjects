from __future__ import annotations
from typing import Optional, Any, Tuple

class Node:
    def __init__(self, value: Any, next: Optional[Node] = None, previous: Optional[Node] = None):
        self.value: Any = value
        self.next: Optional[Node] = next
        self.previous: Optional[Node] = previous
    
    def __str__(self) -> str:
        next_value = self.next.value if self.next else None
        prev_value = self.previous.value if self.previous else None
        return f"Value: {self.value}, Next: {next_value}, Previous: {prev_value}"


class LinkedList:
    def __init__(self, nodes: list[Node], doubly_linked: bool = False, circular: bool = False):
        if not nodes or len(nodes) == 0:
            raise ValueError("LinkedList must be initialized with at least one node.")
        
        self.first: Node = nodes[0]
        self.last: Node = nodes[-1]
        self.doubly_linked = doubly_linked
        self.circular = circular

        for i in range(len(nodes)):
            if i > 0:
                if self.doubly_linked:
                    nodes[i].previous = nodes[i - 1]
            if i < len(nodes) - 1:
                nodes[i].next = nodes[i + 1]

    def insert_back(self, node: Node) -> None:
        if self.doubly_linked:
            node.previous = self.last
        self.last.next = node
        self.last = node
        if self.circular:  
            node.next = self.first
            self.first.previous = node
        else:
            node.next = None

    def insert_front(self, node: Node) -> None:
        node.next = self.first
        if self.doubly_linked:
            if self.circular:
                node.previous = self.last
                self.last.next = node
            else:
                node.previous = None
            self.first.previous = node
        self.first = node
    
    def remove(self, node: Node) -> None:
        if self.doubly_linked:
            if node.previous:
                node.previous.next = node.next
            if node.next:
                node.next.previous = node.previous
        else:
            if node.previous:
                node.previous.next = node.next
        if node == self.first:
            self.first = node.next
        if node == self.last:
            self.last = node.previous

    def manual_insert(self, node: Node) -> None:

        if not node.next and not node.previous:
            raise ValueError("Node must have at least one connection.")
        
        if not node.next and not self.doubly_linked:
            raise ValueError("Singly linked list must have a next node.")

        if self.doubly_linked:
            if node.previous:
                node.previous.next = node
            else:
                node.previous = node.next.previous
                node.next.previous.next = node
                node.next.previous = node
            if node.next:
                node.next.previous = node
        else:
            node.previous = None
        
        Finder = self.first
        if node.next != self.first:
            while Finder.next != node.next:
                Finder = Finder.next
        
            Finder.next = node

        if node.next == self.first:
            self.first = node

        if self.last.next == node:
            self.last = node

        if not self.circular:
            self.remove_loop()
            
    def get_node_from_value(self, value: Any) -> Optional[Node]:
        current = self.first
        while current:
            if current.value == value:
                return current
            current = current.next
        return None

    def detect_loop(self) -> Tuple[bool, Optional[Node]]:
        slow, fast = self.first, self.first
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                print(f"Loop detected at {slow.value}")
                return True, slow
        return False, None
    
    def remove_loop(self) -> None:
        loop_detected, loop_node = self.detect_loop()
        if loop_detected:
            slow = self.first
            while slow != loop_node:
                slow = slow.next
                loop_node = loop_node.next
            
            prev = loop_node
            while prev.next != loop_node:
                prev = prev.next
            
            prev.next = None 
            print("Loop removed.")
        else:
            print("No loop detected.")
    
    def __str__(self) -> str:
        values = []
        current = self.first
        while current:
            values.append(f"[{str(current)}]")
            current = current.next
            if current == self.first:  # To handle circular linked list
                break
        return " -> ".join(values)

# nodes = [Node(i) for i in range(1, 21)]
# linked_list = LinkedList(nodes, doubly_linked=True, circular=True)
# linked_list.insert_front(Node(21))
# print(linked_list)
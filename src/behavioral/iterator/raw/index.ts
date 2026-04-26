// RAW: Client code that traverses different collection types by knowing
// their internal structure. Adding a new collection type means updating
// every traversal site. There is no uniform way to loop over all collections.

class NumberArray {
  items: number[];
  constructor(items: number[]) {
    this.items = items;
  }
}

class NumberTree {
  value: number;
  children: NumberTree[];
  constructor(value: number, children: NumberTree[] = []) {
    this.value = value;
    this.children = children;
  }
}

class NumberLinkedList {
  head: { value: number; next: { value: number; next: null } | null } | null = null;

  append(value: number): void {
    const node = { value, next: null };
    if (!this.head) {
      this.head = node;
      return;
    }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = node;
  }
}

// Three different traversal strategies — client must know each.
function printArray(col: NumberArray): void {
  for (let i = 0; i < col.items.length; i++) {
    console.log(col.items[i]);
  }
}

function printTree(node: NumberTree): void {
  console.log(node.value);
  for (const child of node.children) {
    printTree(child); // must recursively handle tree internals
  }
}

function printLinkedList(list: NumberLinkedList): void {
  let cur = list.head;
  while (cur) {
    console.log(cur.value);
    cur = cur.next;
  }
}

const arr = new NumberArray([1, 2, 3]);
const tree = new NumberTree(1, [new NumberTree(2), new NumberTree(3)]);
const list = new NumberLinkedList();
list.append(1); list.append(2); list.append(3);

printArray(arr);
printTree(tree);
printLinkedList(list);

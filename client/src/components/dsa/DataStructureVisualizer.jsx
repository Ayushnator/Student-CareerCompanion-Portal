import React, { useState, useEffect, useRef } from 'react';

// TreeNode Component for BST
const TreeNode = ({ node }) => {
  if (!node) return <div className="w-8 h-8 opacity-0"></div>;

  return (
    <div className="flex flex-col items-center mx-2">
      <div className={`w-10 h-10 rounded-full border-2 border-indigo-600 flex items-center justify-center bg-white shadow-md z-10 font-bold transition-all duration-300 ${node.isHighlighted ? 'bg-yellow-300 scale-110' : ''}`}>
        {node.value}
      </div>
      {(node.left || node.right) && (
        <div className="flex items-start mt-4 relative">
            {/* Connecting lines could be SVG, but for simplicity using borders or just spacing */}
            {/* To make it look like a tree, we need SVG lines. For now, just layout. */}
            
          <div className="flex gap-4">
            <TreeNode node={node.left} />
            <TreeNode node={node.right} />
          </div>
        </div>
      )}
    </div>
  );
};

const DataStructureVisualizer = () => {
  const [activeTab, setActiveTab] = useState('stack');
  
  // Stack State
  const [stack, setStack] = useState([]);
  const [stackInput, setStackInput] = useState('');
  
  // Queue State
  const [queue, setQueue] = useState([]);
  const [queueInput, setQueueInput] = useState('');

  // Linked List State
  const [linkedList, setLinkedList] = useState([]);
  const [listInput, setListInput] = useState('');

  // BST State
  const [bstRoot, setBstRoot] = useState(null);
  const [bstInput, setBstInput] = useState('');

  // --- Stack Operations ---
  const pushStack = () => {
    if (!stackInput) return;
    setStack([...stack, stackInput]);
    setStackInput('');
  };

  const popStack = () => {
    if (stack.length === 0) return;
    const newStack = [...stack];
    newStack.pop();
    setStack(newStack);
  };

  const peekStack = () => {
    if (stack.length === 0) return alert('Stack is empty');
    alert(`Top element is: ${stack[stack.length - 1]}`);
  };

  // --- Queue Operations ---
  const enqueue = () => {
    if (!queueInput) return;
    setQueue([...queue, queueInput]);
    setQueueInput('');
  };

  const dequeue = () => {
    if (queue.length === 0) return;
    const newQueue = [...queue];
    newQueue.shift();
    setQueue(newQueue);
  };

  // --- Linked List Operations ---
  const insertHead = () => {
    if (!listInput) return;
    setLinkedList([{ value: listInput, next: linkedList.length > 0 ? linkedList[0].id : null, id: Date.now() }, ...linkedList]);
    setListInput('');
  };

  const insertTail = () => {
    if (!listInput) return;
    setLinkedList([...linkedList, { value: listInput, next: null, id: Date.now() }]);
    setListInput('');
  };

  const deleteHead = () => {
    if (linkedList.length === 0) return;
    setLinkedList(linkedList.slice(1));
  };

  const deleteTail = () => {
    if (linkedList.length === 0) return;
    setLinkedList(linkedList.slice(0, -1));
  };

  // --- BST Operations ---
  const insertBST = () => {
    const val = parseInt(bstInput);
    if (isNaN(val)) return;
    
    const newNode = { value: val, left: null, right: null, isHighlighted: false };
    
    if (!bstRoot) {
      setBstRoot(newNode);
    } else {
      const newRoot = JSON.parse(JSON.stringify(bstRoot)); // Deep copy for immutability
      insertNode(newRoot, newNode);
      setBstRoot(newRoot);
    }
    setBstInput('');
  };

  const insertNode = (node, newNode) => {
    if (newNode.value < node.value) {
      if (node.left === null) node.left = newNode;
      else insertNode(node.left, newNode);
    } else {
      if (node.right === null) node.right = newNode;
      else insertNode(node.right, newNode);
    }
  };

  const resetBST = () => {
    setBstRoot(null);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Data Structures Visualizer</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        {['stack', 'queue', 'linked-list', 'bst'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded capitalize transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab === 'bst' ? 'Binary Search Tree' : tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Stack Visualizer */}
      {activeTab === 'stack' && (
        <div className="w-full flex flex-col items-center">
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <input
              type="text"
              value={stackInput}
              onChange={(e) => setStackInput(e.target.value)}
              placeholder="Value"
              className="border p-2 rounded w-full sm:w-auto"
            />
            <button onClick={pushStack} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto">Push</button>
            <button onClick={popStack} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto">Pop</button>
            <button onClick={peekStack} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full sm:w-auto">Peek</button>
          </div>
          
          <div className="flex flex-col-reverse items-center border-b-4 border-gray-800 min-h-[200px] w-full max-w-xs sm:w-32 p-2 bg-gray-50 rounded-t-lg relative">
            {stack.length === 0 && <span className="text-gray-400 absolute top-1/2 -translate-y-1/2">Empty</span>}
            {stack.map((item, idx) => (
              <div key={idx} className="w-full h-10 bg-blue-500 text-white flex items-center justify-center border-b border-blue-600 animate-in fade-in slide-in-from-top-2 duration-300">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">Stack (LIFO)</div>
        </div>
      )}

      {/* Queue Visualizer */}
      {activeTab === 'queue' && (
        <div className="w-full flex flex-col items-center">
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <input
              type="text"
              value={queueInput}
              onChange={(e) => setQueueInput(e.target.value)}
              placeholder="Value"
              className="border p-2 rounded w-full sm:w-auto"
            />
            <button onClick={enqueue} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto">Enqueue</button>
            <button onClick={dequeue} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto">Dequeue</button>
          </div>

          <div className="flex items-center border-2 border-gray-300 min-h-[60px] p-2 bg-gray-50 rounded w-full max-w-2xl overflow-x-auto gap-2">
            {queue.length === 0 && <span className="text-gray-400 mx-auto">Empty Queue</span>}
            {queue.map((item, idx) => (
              <div key={idx} className="min-w-[50px] h-10 bg-purple-500 text-white flex items-center justify-center rounded animate-in fade-in slide-in-from-right-2 duration-300">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">Queue (FIFO)</div>
        </div>
      )}

      {/* Linked List Visualizer */}
      {activeTab === 'linked-list' && (
        <div className="w-full flex flex-col items-center">
           <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <input
              type="text"
              value={listInput}
              onChange={(e) => setListInput(e.target.value)}
              placeholder="Value"
              className="border p-2 rounded w-full sm:w-auto"
            />
            <button onClick={insertHead} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto">Insert Head</button>
            <button onClick={insertTail} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto">Insert Tail</button>
            <button onClick={deleteHead} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto">Delete Head</button>
            <button onClick={deleteTail} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full sm:w-auto">Delete Tail</button>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-2 w-full max-w-4xl p-4 min-h-[100px] overflow-x-auto">
             {linkedList.length === 0 && <span className="text-gray-400">Empty List</span>}
             {linkedList.map((node, idx) => (
               <div key={node.id} className="flex items-center shrink-0">
                 <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-indigo-600 flex items-center justify-center bg-white shadow-md relative z-10 text-sm sm:text-base">
                   {node.value}
                 </div>
                 {idx < linkedList.length - 1 && (
                   <div className="w-8 sm:w-12 h-1 bg-gray-400 relative">
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-gray-400 border-b-4 border-b-transparent"></div>
                   </div>
                 )}
               </div>
             ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">Singly Linked List</div>
        </div>
      )}

      {/* BST Visualizer */}
      {activeTab === 'bst' && (
        <div className="w-full flex flex-col items-center">
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <input
              type="number"
              value={bstInput}
              onChange={(e) => setBstInput(e.target.value)}
              placeholder="Value"
              className="border p-2 rounded w-full sm:w-auto"
            />
            <button onClick={insertBST} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto">Insert</button>
            <button onClick={resetBST} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full sm:w-auto">Reset</button>
          </div>

          <div className="w-full overflow-auto flex justify-center p-8 min-h-[300px] border rounded bg-gray-50">
            {bstRoot ? <TreeNode node={bstRoot} /> : <span className="text-gray-400 self-center">Empty Tree</span>}
          </div>
          <div className="mt-2 text-sm text-gray-600">Binary Search Tree</div>
        </div>
      )}
    </div>
  );
};

export default DataStructureVisualizer;

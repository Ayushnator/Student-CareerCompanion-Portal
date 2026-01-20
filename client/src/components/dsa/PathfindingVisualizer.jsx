import React, { useState, useEffect, useRef } from 'react';

const ROWS = 15;
const COLS = 30;
const START_NODE_ROW = 5;
const START_NODE_COL = 5;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 25;

const PathfindingVisualizer = () => {
  const [grid, setGrid] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [algorithm, setAlgorithm] = useState('bfs');
  
  const gridRef = useRef([]);
  const stopRef = useRef(false);

  useEffect(() => {
    resetGrid();
    return () => {
      stopRef.current = true;
    };
  }, []);

  const resetGrid = () => {
    stopRef.current = true;
    setIsRunning(false);
    
    setTimeout(() => {
        stopRef.current = false;
        const initialGrid = getInitialGrid();
        
        // Add hard-coded immutable boundary walls (Rectangle Box)
        // This limits the search space to prevent browser unresponsiveness with algorithms like DFS
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                // Skip start and finish nodes
                if (initialGrid[r][c].isStart || initialGrid[r][c].isFinish) continue;

                // Create a clear rectangular box of non-dynamic walls
                // This acts as a boundary for the search algorithms
                if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
                    initialGrid[r][c].isWall = true;
                }

                // Restore internal walls with gaps (Task 1)
                // Wall 1 at column 10, with gaps
                if (c === 10) {
                    // Leave gap at rows 2-4 and 10-12
                    if (!((r >= 2 && r <= 4) || (r >= 10 && r <= 12))) {
                        if (!initialGrid[r][c].isStart && !initialGrid[r][c].isFinish) {
                            initialGrid[r][c].isWall = true;
                        }
                    }
                }
                
                // Wall 2 at column 20, with gaps
                if (c === 20) {
                    // Leave gap at rows 5-7 and 11-13
                     if (!((r >= 5 && r <= 7) || (r >= 11 && r <= 13))) {
                        if (!initialGrid[r][c].isStart && !initialGrid[r][c].isFinish) {
                            initialGrid[r][c].isWall = true;
                        }
                    }
                }
            }
        }

        setGrid(initialGrid);
        gridRef.current = initialGrid;
        
        // Clear DOM classes
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const node = initialGrid[row][col];
                const element = document.getElementById(`node-${row}-${col}`);
                if (element) {
                    let className = 'node';
                    if (node.isStart) className += ' node-start bg-green-500';
                    else if (node.isFinish) className += ' node-finish bg-red-500';
                    else if (node.isWall) className += ' bg-gray-800';
                    else className += ' bg-white';
                    element.className = className;
                }
            }
        }
    }, 100);
  };

  const getInitialGrid = () => {
    const grid = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < COLS; col++) {
        currentRow.push(createNode(col, row));
      }
      grid.push(currentRow);
    }
    return grid;
  };

  const createNode = (col, row) => {
    return {
      col,
      row,
      isStart: row === START_NODE_ROW && col === START_NODE_COL,
      isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
      distance: Infinity,
      isVisited: false,
      isWall: false,
      previousNode: null,
      fScore: Infinity,
    };
  };

  const visualize = async () => {
    if (isRunning) {
        stopRef.current = true;
        setIsRunning(false);
        return;
    }
    stopRef.current = false;
    setIsRunning(true);
    
    const startNode = gridRef.current[START_NODE_ROW][START_NODE_COL];
    const finishNode = gridRef.current[FINISH_NODE_ROW][FINISH_NODE_COL];
    
    // Reset path finding state
    const currentGrid = gridRef.current;
    for(let r=0; r<ROWS; r++){
        for(let c=0; c<COLS; c++){
            const node = currentGrid[r][c];
            node.distance = Infinity;
            node.isVisited = false;
            node.previousNode = null;
            node.fScore = Infinity;
            
            // Visual reset (keep walls)
            const el = document.getElementById(`node-${r}-${c}`);
            if(el) {
                if (node.isStart) el.className = 'node node-start bg-green-500';
                else if (node.isFinish) el.className = 'node node-finish bg-red-500';
                else if (node.isWall) el.className = 'node bg-gray-800';
                else el.className = 'node bg-white';
            }
        }
    }

    let visitedNodesInOrder = [];
    let nodesInShortestPathOrder = [];

    if (algorithm === 'bfs') {
        visitedNodesInOrder = bfs(gridRef.current, startNode, finishNode);
    } else if (algorithm === 'dfs') {
        visitedNodesInOrder = dfs(gridRef.current, startNode, finishNode);
    } else if (algorithm === 'astar') {
        visitedNodesInOrder = astar(gridRef.current, startNode, finishNode);
    } else if (algorithm === 'dijkstra') {
        visitedNodesInOrder = dijkstra(gridRef.current, startNode, finishNode);
    } else if (algorithm === 'greedy') {
        visitedNodesInOrder = greedyBFS(gridRef.current, startNode, finishNode);
    }
    
    nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    await animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    setIsRunning(false);
  };

  // Algorithms (Simplified for brevity, same logic as before)
  const bfs = (grid, startNode, finishNode) => {
    const visitedNodesInOrder = [];
    const queue = [startNode];
    startNode.isVisited = true;
    while(queue.length) {
        const node = queue.shift();
        if (node.isWall) continue;
        visitedNodesInOrder.push(node);
        if (node === finishNode) return visitedNodesInOrder;
        const neighbors = getNeighbors(node, grid);
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited && !neighbor.isWall) {
                neighbor.isVisited = true;
                neighbor.previousNode = node;
                queue.push(neighbor);
            }
        }
    }
    return visitedNodesInOrder;
  };

  const dfs = (grid, startNode, finishNode) => {
      const visitedNodesInOrder = [];
      // Stack stores { node, parent } to prevent cycle creation in previousNode
      const stack = [{ node: startNode, parent: null }];
      
      while(stack.length){
          const { node, parent } = stack.pop();
          
          if(!node.isVisited && !node.isWall){
              node.isVisited = true;
              node.previousNode = parent; // Set parent only when visiting
              visitedNodesInOrder.push(node);
              
              if(node === finishNode) return visitedNodesInOrder;
              
              const neighbors = getNeighbors(node, grid);
              // Push neighbors to stack (if not visited)
              for(const n of neighbors) {
                  if (!n.isVisited) {
                      stack.push({ node: n, parent: node });
                  }
              }
          }
      }
      return visitedNodesInOrder;
  };

  const astar = (grid, startNode, finishNode) => {
      const visitedNodesInOrder = [];
      startNode.distance = 0;
      startNode.fScore = heuristic(startNode, finishNode);
      const openSet = [startNode];
      while(openSet.length){
          openSet.sort((a,b) => a.fScore - b.fScore);
          const node = openSet.shift();
          if(node.isVisited || node.isWall) continue;
          node.isVisited = true;
          visitedNodesInOrder.push(node);
          if(node === finishNode) return visitedNodesInOrder;
          
          const neighbors = getNeighbors(node, grid);
          for(const n of neighbors){
              if(n.isVisited || n.isWall) continue;
              const tempG = node.distance + 1;
              if(tempG < n.distance){
                  n.distance = tempG;
                  n.fScore = tempG + heuristic(n, finishNode);
                  n.previousNode = node;
                  if(!openSet.includes(n)) openSet.push(n);
              }
          }
      }
      return visitedNodesInOrder;
  };

  const dijkstra = (grid, startNode, finishNode) => {
      const visitedNodesInOrder = [];
      startNode.distance = 0;
      const unvisited = getAllNodes(grid);
      while(unvisited.length){
          sortNodesByDistance(unvisited);
          const node = unvisited.shift();
          if(node.isWall) continue;
          if(node.distance === Infinity) return visitedNodesInOrder;
          node.isVisited = true;
          visitedNodesInOrder.push(node);
          if(node === finishNode) return visitedNodesInOrder;
          updateUnvisitedNeighbors(node, grid);
      }
      return visitedNodesInOrder;
  };

  const greedyBFS = (grid, startNode, finishNode) => {
      // similar to A* but fScore = h(n)
      const visitedNodesInOrder = [];
      startNode.distance = 0;
      startNode.fScore = heuristic(startNode, finishNode);
      const openSet = [startNode];
      while(openSet.length){
          openSet.sort((a,b) => a.fScore - b.fScore);
          const node = openSet.shift();
          if(node.isVisited || node.isWall) continue;
          node.isVisited = true;
          visitedNodesInOrder.push(node);
          if(node === finishNode) return visitedNodesInOrder;
          const neighbors = getNeighbors(node, grid);
          for(const n of neighbors){
              if(n.isVisited || n.isWall) continue;
              n.fScore = heuristic(n, finishNode);
              n.previousNode = node;
              if(!openSet.includes(n)) openSet.push(n);
          }
      }
      return visitedNodesInOrder;
  };

  // Helpers
  const getNeighbors = (node, grid) => {
      const neighbors = [];
      const {col, row} = node;
      if (row > 0) neighbors.push(grid[row - 1][col]);
      if (row < ROWS - 1) neighbors.push(grid[row + 1][col]);
      if (col > 0) neighbors.push(grid[row][col - 1]);
      if (col < COLS - 1) neighbors.push(grid[row][col + 1]);
      return neighbors;
  };
  const heuristic = (nodeA, nodeB) => Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
  const getAllNodes = (grid) => {
      const nodes = [];
      for (const row of grid) for (const node of row) nodes.push(node);
      return nodes;
  };
  const sortNodesByDistance = (nodes) => nodes.sort((a, b) => a.distance - b.distance);
  const updateUnvisitedNeighbors = (node, grid) => {
      const neighbors = getNeighbors(node, grid);
      for (const neighbor of neighbors) {
          if (!neighbor.isVisited) {
              neighbor.distance = node.distance + 1;
              neighbor.previousNode = node;
          }
      }
  };
  const getNodesInShortestPathOrder = (finishNode) => {
      const nodes = [];
      let currentNode = finishNode;
      while (currentNode !== null) {
          nodes.unshift(currentNode);
          currentNode = currentNode.previousNode;
      }
      return nodes;
  };

  const animateAlgorithm = async (visitedNodesInOrder, nodesInShortestPathOrder) => {
      for (let i = 0; i < visitedNodesInOrder.length; i++) {
          if (stopRef.current) return;
          const node = visitedNodesInOrder[i];
          if (!node.isStart && !node.isFinish) {
              const el = document.getElementById(`node-${node.row}-${node.col}`);
              if(el) el.className = 'node node-visited bg-blue-400';
          }
          await new Promise(r => setTimeout(r, 10));
      }
      if (stopRef.current) return;
      for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
          if (stopRef.current) return;
          const node = nodesInShortestPathOrder[i];
          if (!node.isStart && !node.isFinish) {
              const el = document.getElementById(`node-${node.row}-${node.col}`);
              if(el) el.className = 'node node-path bg-yellow-400';
          }
          await new Promise(r => setTimeout(r, 30));
      }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-2">
        <select 
            value={algorithm} 
            onChange={(e) => setAlgorithm(e.target.value)}
            className="border rounded px-3 py-2 bg-white"
        >
            <option value="bfs">Breadth-First Search</option>
            <option value="dfs">Depth-First Search</option>
            <option value="dijkstra">Dijkstra's Algorithm</option>
            <option value="astar">A* Search</option>
            <option value="greedy">Greedy Best-First</option>
        </select>
        <button 
            onClick={visualize} 
            disabled={isRunning}
            className={`px-4 py-2 rounded text-white ${isRunning ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
            {isRunning ? 'Running...' : 'Visualize'}
        </button>
        <button 
            onClick={resetGrid} 
            disabled={isRunning}
            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
        >
            Reset
        </button>
      </div>

      <div className="grid gap-0 border border-gray-300 bg-white shadow-sm max-w-full overflow-hidden" style={{ 
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          width: '100%',
          aspectRatio: `${COLS}/${ROWS}`
      }}>
        {grid.map((row, rowIdx) => (
            row.map((node, colIdx) => (
                <div
                    key={`${rowIdx}-${colIdx}`}
                    id={`node-${rowIdx}-${colIdx}`}
                    className={`w-full h-full border-[1px] border-gray-100 ${
                        node.isStart ? 'bg-green-500' :
                        node.isFinish ? 'bg-red-500' :
                        node.isWall ? 'bg-gray-800' : 'bg-white'
                    }`}
                ></div>
            ))
        ))}
      </div>
      
      <div className="mt-4 flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1"><div className="w-4 h-4 bg-green-500"></div> Start</div>
          <div className="flex items-center gap-1"><div className="w-4 h-4 bg-red-500"></div> Target</div>
          <div className="flex items-center gap-1"><div className="w-4 h-4 bg-gray-800"></div> Wall</div>
          <div className="flex items-center gap-1"><div className="w-4 h-4 bg-blue-400"></div> Visited</div>
          <div className="flex items-center gap-1"><div className="w-4 h-4 bg-yellow-400"></div> Shortest Path</div>
      </div>
    </div>
  );
};

export default PathfindingVisualizer;

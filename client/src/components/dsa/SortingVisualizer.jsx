import React, { useState, useEffect, useRef } from 'react';

const SortingVisualizer = () => {
  const [array, setArray] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState('bubble');
  const stopRef = useRef(false);

  useEffect(() => {
    resetArray();
    return () => {
      stopRef.current = true;
    };
  }, []);

  const resetArray = () => {
    if (isSorting) {
      stopRef.current = true;
      setIsSorting(false);
      setTimeout(() => {
        stopRef.current = false;
        generateArray();
      }, 100);
    } else {
      generateArray();
    }
  };

  const generateArray = () => {
    const newArray = [];
    for (let i = 0; i < 50; i++) {
      newArray.push(randomIntFromInterval(10, 400));
    }
    setArray(newArray);
  };

  const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const checkStop = () => stopRef.current;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSort = async () => {
    if (isSorting) {
      stopRef.current = true;
      setIsSorting(false);
      return;
    }

    stopRef.current = false;
    setIsSorting(true);

    try {
      if (algorithm === 'bubble') await bubbleSort();
      else if (algorithm === 'selection') await selectionSort();
      else if (algorithm === 'insertion') await insertionSort();
      else if (algorithm === 'merge') await mergeSort();
      else if (algorithm === 'quick') await quickSort();
      else if (algorithm === 'heap') await heapSort();
    } catch (e) {
      console.log("Sort stopped");
    }

    setIsSorting(false);
    stopRef.current = false;
  };

  const bubbleSort = async () => {
    const arr = [...array];
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (checkStop()) return;
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          await sleep(101 - speed);
        }
      }
    }
  };

  const selectionSort = async () => {
    const arr = [...array];
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let min_idx = i;
      for (let j = i + 1; j < n; j++) {
        if (checkStop()) return;
        if (arr[j] < arr[min_idx]) min_idx = j;
      }
      if (min_idx !== i) {
        [arr[i], arr[min_idx]] = [arr[min_idx], arr[i]];
        setArray([...arr]);
        await sleep(101 - speed);
      }
    }
  };

  const insertionSort = async () => {
    const arr = [...array];
    const n = arr.length;
    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;
      while (j >= 0 && arr[j] > key) {
        if (checkStop()) return;
        arr[j + 1] = arr[j];
        j = j - 1;
        setArray([...arr]);
        await sleep(101 - speed);
      }
      arr[j + 1] = key;
      setArray([...arr]);
      await sleep(101 - speed);
    }
  };

  // Merge Sort
  const mergeSort = async () => {
    let arr = [...array];
    await mergeSortHelper(arr, 0, arr.length - 1);
  };

  const mergeSortHelper = async (arr, left, right) => {
    if (left >= right || checkStop()) return;
    const mid = Math.floor((left + right) / 2);
    await mergeSortHelper(arr, left, mid);
    await mergeSortHelper(arr, mid + 1, right);
    await merge(arr, left, mid, right);
  };

  const merge = async (arr, left, mid, right) => {
    if (checkStop()) return;
    const n1 = mid - left + 1;
    const n2 = right - mid;
    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = arr[left + i];
    for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

    let i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
      if (checkStop()) return;
      if (L[i] <= R[j]) {
        arr[k] = L[i];
        i++;
      } else {
        arr[k] = R[j];
        j++;
      }
      setArray([...arr]);
      await sleep(101 - speed);
      k++;
    }

    while (i < n1) {
      if (checkStop()) return;
      arr[k] = L[i];
      i++;
      k++;
      setArray([...arr]);
      await sleep(101 - speed);
    }

    while (j < n2) {
      if (checkStop()) return;
      arr[k] = R[j];
      j++;
      k++;
      setArray([...arr]);
      await sleep(101 - speed);
    }
  };

  const quickSort = async () => {
    let arr = [...array];
    await quickSortHelper(arr, 0, arr.length - 1);
  };

  const quickSortHelper = async (arr, low, high) => {
    if (low < high) {
      if (checkStop()) return;
      let pi = await partition(arr, low, high);
      await quickSortHelper(arr, low, pi - 1);
      await quickSortHelper(arr, pi + 1, high);
    }
  };

  const partition = async (arr, low, high) => {
    if (checkStop()) return low;
    let pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (checkStop()) return i;
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray([...arr]);
        await sleep(101 - speed);
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArray([...arr]);
    await sleep(101 - speed);
    return i + 1;
  };

  const heapSort = async () => {
    let arr = [...array];
    let n = arr.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      if (checkStop()) return;
      await heapify(arr, n, i);
    }

    for (let i = n - 1; i > 0; i--) {
      if (checkStop()) return;
      [arr[0], arr[i]] = [arr[i], arr[0]];
      setArray([...arr]);
      await sleep(101 - speed);
      await heapify(arr, i, 0);
    }
  };

  const heapify = async (arr, n, i) => {
    if (checkStop()) return;
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;

    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      setArray([...arr]);
      await sleep(101 - speed);
      await heapify(arr, n, largest);
    }
  };

  const getComplexity = (algo) => {
      switch(algo) {
          case 'bubble': return { time: 'O(n²)', space: 'O(1)' };
          case 'selection': return { time: 'O(n²)', space: 'O(1)' };
          case 'insertion': return { time: 'O(n²)', space: 'O(1)' };
          case 'merge': return { time: 'O(n log n)', space: 'O(n)' };
          case 'quick': return { time: 'O(n log n)', space: 'O(log n)' };
          case 'heap': return { time: 'O(n log n)', space: 'O(1)' };
          default: return { time: '', space: '' };
      }
  };

  const complexity = getComplexity(algorithm);

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Sorting Visualizer</h2>
      
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <button
          onClick={resetArray}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
        >
          Generate New Array
        </button>
        
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          disabled={isSorting}
          className="px-4 py-2 border rounded bg-white"
        >
          <option value="bubble">Bubble Sort</option>
          <option value="selection">Selection Sort</option>
          <option value="insertion">Insertion Sort</option>
          <option value="merge">Merge Sort</option>
          <option value="quick">Quick Sort</option>
          <option value="heap">Heap Sort</option>
        </select>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Speed:</label>
          <input
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-32"
          />
        </div>

        <button
          onClick={handleSort}
          className={`px-6 py-2 rounded font-medium text-white ${isSorting ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSorting ? 'Stop' : 'Start Sort'}
        </button>
      </div>

      <div className="flex items-end justify-center w-full h-64 bg-gray-50 border rounded p-4 gap-1">
        {array.map((value, idx) => (
          <div
            key={idx}
            className="bg-blue-500 hover:bg-blue-600 transition-colors"
            style={{
              height: `${(value / 400) * 100}%`,
              width: `${100 / array.length}%`,
            }}
            title={value}
          ></div>
        ))}
      </div>
      <div className="mt-4 flex gap-8 text-sm text-gray-600">
        <div>
            <span className="font-semibold">Time Complexity:</span> {complexity.time}
        </div>
        <div>
            <span className="font-semibold">Space Complexity:</span> {complexity.space}
        </div>
      </div>
    </div>
  );
};

export default SortingVisualizer;

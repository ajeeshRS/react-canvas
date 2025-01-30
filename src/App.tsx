import { useEffect, useRef, useState } from "react";
import Toolbar, { Tools } from "./components/Toolbar";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  interface Shape {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  const currentShapesRef = useRef<Shape[]>([]);
  const selectedRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [selectedTool, setSelectedTool] = useState<Tools>("POINTER");

  const updateRef = (value: Tools) => {
    setSelectedTool(value);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    
    if (canvas) {
      if (selectedTool === "POINTER") return;

      canvas.setAttribute("tabindex", "0");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let isDrawing = false;
      let isMoving = false;
      let startX = 0;
      let startY = 0;

      const isPointInShape = (x: number, y: number, shape: Shape) => {
        const withinX = x >= shape.x && x <= shape.x + shape.width;
        const withinY = y >= shape.y && y <= shape.y + shape.height;

        return withinX && withinY;
      };

      // canvas redraw logic
      const redrawCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        currentShapesRef.current.forEach(
          ({ x, y, width, height }, i: number) => {
            const isSelected = i === selectedRef.current;

            if (isSelected) {
              ctx.strokeStyle = "rgba(0, 127, 206)";
              ctx.lineWidth = 1;
              ctx.strokeRect(x - 3, y - 3, width + 6, height + 6);
              ctx.stroke();
            }

            ctx.strokeStyle = "black";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, [20]);
            ctx.stroke();
          }
        );
      };

      // handle shape deletion
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Backspace" && selectedRef.current !== null) {
          if (selectedRef.current !== null) {
            currentShapesRef.current.splice(selectedRef.current, 1);
            selectedRef.current = null;
            redrawCanvas();
          }
        }
      };

      // mouse down handler
      const handleMouseDown = (e: MouseEvent) => {
        isDrawing = true;

        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.x;
        startY = e.clientY - rect.y;

        for (let i = 0; i < currentShapesRef.current.length; i++) {
          const shape = currentShapesRef.current[i];

          if (isPointInShape(startX, startY, shape)) {
            selectedRef.current = i;
            isMoving = true;
            startPosRef.current = { x: startX, y: startY };
            redrawCanvas();
            return;
          }

          selectedRef.current = null;
          redrawCanvas();
        }
      };

      // mouse up handler
      const handleMouseUp = (e: MouseEvent) => {
        if (!isMoving && isDrawing) {
          const rect = canvas.getBoundingClientRect();

          const width = e.clientX - rect.x - startX;
          const height = e.clientY - rect.y - startY;

          const shape: Shape = {
            x: startX,
            y: startY,
            width,
            height,
          };

          currentShapesRef.current.push(shape);
        }

        isDrawing = false;
        isMoving = false;
        redrawCanvas();
      };

      // mouse move handler
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();

        if (isMoving && selectedRef.current !== null && isDrawing) {
          canvas.style.cursor = "move";

          const mouseX = e.clientX - rect.x;
          const mouseY = e.clientY - rect.y;

          const changeX = mouseX - startPosRef.current.x;
          const changeY = mouseY - startPosRef.current.y;

          const newShapes = [...currentShapesRef.current];

          newShapes[selectedRef.current] = {
            ...currentShapesRef.current[selectedRef.current],
            x: currentShapesRef.current[selectedRef.current].x + changeX,
            y: currentShapesRef.current[selectedRef.current].y + changeY,
          };

          currentShapesRef.current = newShapes;
          startPosRef.current = { x: mouseX, y: mouseY };
          redrawCanvas();
        } else if (isDrawing) {
          canvas.style.cursor = "default";

          const width = e.clientX - rect.x - startX;
          const height = e.clientY - rect.y - startY;

          redrawCanvas();

          ctx.strokeStyle = "black";
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.roundRect(startX, startY, width, height, [20]);
          ctx.stroke();
        } else {
          canvas.style.cursor = "default";
        }
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("keydown", handleKeyDown);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedTool]);

  return (
    <div className="h-screen w-screen overflow-scroll">
      <canvas
        ref={canvasRef}
        width={2000}
        height={1000}
        className="bg-white †ext-black focus:outline-none"
      ></canvas>
      <Toolbar selectedTool={selectedTool} updateTool={updateRef} />
    </div>
  );
}

export default App;

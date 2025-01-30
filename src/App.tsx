import { useEffect, useRef, useState } from "react";
import Toolbar, { Tools } from "./components/Toolbar";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  type Shape =
    | {
        type: "RECT";
        x: number;
        y: number;
        width: number;
        height: number;
      }
    | {
        type: "CIRCLE";
        centerX: number;
        centerY: number;
        radius: number;
      };

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
        if (shape.type === "RECT") {
          const withinX = x >= shape.x && x <= shape.x + shape.width;
          const withinY = y >= shape.y && y <= shape.y + shape.height;
          return withinX && withinY;
        } else if (shape.type === "CIRCLE") {
          const distX = x - shape.centerX;
          const distY = y - shape.centerY;
          return Math.sqrt(distX ** 2 + distY ** 2) <= shape.radius;
        }
      };

      // canvas redraw logic
      const redrawCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        currentShapesRef.current.forEach((shape: Shape, i: number) => {
          const isSelected = i === selectedRef.current;

          if (isSelected && shape.type === "RECT") {
            ctx.strokeStyle = "rgba(0, 127, 206)";
            ctx.lineWidth = 1;
            ctx.strokeRect(
              shape.x - 3,
              shape.y - 3,
              shape.width + 6,
              shape.height + 6
            );
            ctx.stroke();
          } else if (isSelected && shape.type === "CIRCLE") {
            ctx.strokeStyle = "rgba(0, 127, 206)";
            ctx.lineWidth = 1;
            ctx.strokeRect(
              shape.centerX - shape.radius - 3,
              shape.centerY - shape.radius - 3,
              shape.radius * 2 + 6,
              shape.radius * 2 + 6
            );
          }

          if (shape.type === "RECT") {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(shape.x, shape.y, shape.width, shape.height, [20]);
            ctx.stroke();
          }

          if (shape.type === "CIRCLE") {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
          }
        });
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

          if (selectedTool === "RECT") {
            const shape: Shape = {
              type: "RECT",
              x: startX,
              y: startY,
              width,
              height,
            };
            currentShapesRef.current.push(shape);
          }

          if (selectedTool === "CIRCLE") {
            const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
            const centerX = startX + width / 2;
            const centerY = startY + height / 2;

            const shape: Shape = {
              type: "CIRCLE",
              centerX,
              centerY,
              radius,
            };
            currentShapesRef.current.push(shape);
          }
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
          const selectedShape = selectedRef.current;

          const mouseX = e.clientX - rect.x;
          const mouseY = e.clientY - rect.y;

          const changeX = mouseX - startPosRef.current.x;
          const changeY = mouseY - startPosRef.current.y;

          const newShapes = [...currentShapesRef.current];

          newShapes[selectedShape] = {
            ...currentShapesRef.current[selectedShape],
            ...(currentShapesRef.current[selectedShape].type === "RECT"
              ? {
                  x: currentShapesRef.current[selectedShape].x + changeX,
                  y: currentShapesRef.current[selectedShape].y + changeY,
                }
              : currentShapesRef.current[selectedShape].type === "CIRCLE" && {
                  centerX:
                    currentShapesRef.current[selectedShape].centerX + changeX,
                  centerY:
                    currentShapesRef.current[selectedShape].centerY + changeY,
                }),
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

          if (selectedTool === "RECT") {
            ctx.beginPath();
            ctx.roundRect(startX, startY, width, height, [20]);
            ctx.stroke();
          }

          if (selectedTool === "CIRCLE") {
            ctx.beginPath();
            const centerX = startX + width / 2;
            const centerY = startY + height / 2;
            const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
          }
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

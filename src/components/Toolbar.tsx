import {
  Circle,
  Minus,
  MousePointer,
  Pencil,
  Square,
  TypeOutline,
} from "lucide-react";

export type Tools =
  | "POINTER"
  | "RECT"
  | "CIRCLE"
  | "PENCIL"
  | "LINE"
  | "TEXT"
  | "ERASER";

export default function Toolbar({
  updateTool,
  selectedTool,
}: {
  selectedTool: Tools;
  updateTool: (value: Tools) => void;
}) {
  const handleSelection = (tool: Tools) => {
    console.log(tool);
    updateTool(tool);
  };

  const tools = [
    { name: "POINTER", icon: <MousePointer className="w-5 h-5" /> },
    { name: "RECT", icon: <Square className="w-5 h-5" /> },
    { name: "CIRCLE", icon: <Circle className="w-5 h-5" /> },
    { name: "LINE", icon: <Minus className="w-5 h-5" /> },
    { name: "PENCIL", icon: <Pencil className="w-5 h-5" /> },
    { name: "TEXT", icon: <TypeOutline className="w-5 h-5" /> },
  ];

  return (
    <div className="flex items-center justify-center w-full fixed bottom-4">
      <div className="flex items-center space-x-4 bg-white shadow-md border px-5 text-black rounded-xl">
        {tools.map((tool) => (
          <p
            key={tool.name}
            onClick={() => handleSelection(tool.name as Tools)}
            className={`p-3  my-1 rounded-lg cursor-pointer ${
              selectedTool === tool.name
                ? "bg-neutral-200"
                : "hover:bg-neutral-100"
            }`}
          >
            {tool.icon}
          </p>
        ))}
      </div>
    </div>
  );
}

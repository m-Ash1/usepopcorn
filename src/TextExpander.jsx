import React from "react";
const TextExpander = ({
  children,
  collapsedNumWords = 10,
  expandButtonText = "Show more",
  collapseButtonText = "Show less",
  buttonColor = "blue",
  expanded = false,
  className = "box",
}) => {
  const [isExpanded, setIsExpanded] = React.useState(expanded);
  return (
    <div className={className}>
      {isExpanded
        ? children
        : children.split(" ").slice(0, collapsedNumWords).join(" ") + "... "}
      {"  "}
      <button
        style={{
          border: "none",
          color: buttonColor,
          backgroundColor: "none",
          cursor: "pointer",
          font: "inherit",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? collapseButtonText : expandButtonText}
      </button>
    </div>
  );
};

export default TextExpander;

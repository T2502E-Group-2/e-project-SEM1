import React, { useState } from "react";
import { Collapse, Form } from "react-bootstrap";

const getExpandedItems = () => {
  const stored = localStorage.getItem("expanded_filters");
  return stored ? JSON.parse(stored) : [];
};

const FilterItem = ({
  label,
  count,
  onCheck,
  isChecked,
  isParent,
  children,
}) => {
  const [open, setOpen] = useState(() => {
    const expanded = getExpandedItems();
    return expanded.includes(label);
  });

  const handleCheckboxChange = (e) => {
    onCheck(e.target.checked);
  };

  const handleToggle = () => {
    const updated = !open;
    setOpen(updated);

    const expanded = getExpandedItems();
    let newExpanded;

    if (updated) {
      newExpanded = [...new Set([...expanded, label])];
    } else {
      newExpanded = expanded.filter((item) => item !== label);
    }

    localStorage.setItem("expanded_filters", JSON.stringify(newExpanded));
  };

  return (
    <div className="mb-2 filter-item-container">
      <div
        className="d-flex justify-content-between align-items-center"
        style={{ cursor: "pointer" }}
        onClick={handleToggle}>
        <Form.Check
          type="checkbox"
          id={`filter-${label.replace(/\s+/g, "-")}`}
          label={`${label} (${count})`}
          checked={isChecked}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
        />
        {children && React.Children.count(children) > 0 && (
          <span>{open ? "−" : "+"}</span>
        )}
      </div>
      <Collapse in={open}>
        <div className="ms-4 mt-1">{children}</div>
      </Collapse>
    </div>
  );
};

export default FilterItem;

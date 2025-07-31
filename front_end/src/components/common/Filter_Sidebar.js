import React, { useState } from "react";
import { Collapse } from "react-bootstrap";

const FilterItem = ({ label, count, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-2">
      <div
        className="d-flex justify-content-between align-items-center"
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer", fontWeight: "bold" }}>
        <span>
          <input type="checkbox" className="me-2" />
          {label} ({count})
        </span>
        <span>{open ? "−" : "+"}</span>
      </div>
      <Collapse in={open}>
        <div className="ms-4 mt-1">{children}</div>
      </Collapse>
    </div>
  );
};

const FilterSidebar = () => {
  return (
    <div>
      <h5
        className="mb-4"
        style={{ fontWeight: "bold", color: "white", fontSize: "1.2rem" }}>
        CATEGORIES
      </h5>

      <FilterItem label="Accessories" count={79}>
        <FilterItem label="Personal Care" count={26} />
        <FilterItem label="Headwear" count={11} />
        <FilterItem label="Eyewear" count={14} />
        <FilterItem label="Handwear" count={13} />
        <FilterItem label="Electronics" count={12} />
        <FilterItem label="Maintenance & Repair" count={1} />
      </FilterItem>

      <FilterItem label="Equipment" count={100}>
        <FilterItem label="Camp Kitchen" count={28} />
        <FilterItem label="Packs & Bags" count={15} />
        <FilterItem label="Climbing" count={37} />
        <FilterItem label="Sleeping" count={21} />
      </FilterItem>

      <FilterItem label="Footwear" count={25}>
        <FilterItem label="Boots" count={7} />
        <FilterItem label="Booties" count={1} />
        <FilterItem label="Overboots" count={1} />
        <FilterItem label="Insoles" count={1} />
        <FilterItem label="Socks" count={11} />
        <FilterItem label="Gaiters" count={4} />
      </FilterItem>

      <FilterItem label="Gifts" count={13}>
        <FilterItem label="Logo Items" count={11} />
        <FilterItem label="Other Gift" count={2} />
      </FilterItem>

      <FilterItem label="Men" count={43}>
        <FilterItem label="Men's Insulation" count={13} />
        <FilterItem label="Men's Hardshells" count={8} />
        <FilterItem label="Men's Baselayers" count={9} />
        <FilterItem label="Men's Midlayers" count={4} />
        <FilterItem label="Men's Softshells" count={8} />
      </FilterItem>

      <FilterItem label="Women" count={44}>
        <FilterItem label="Women's Baselayer" count={12} />
        <FilterItem label="Women's Insulation" count={13} />
        <FilterItem label="Women's Softshells" count={7} />
        <FilterItem label="Women's Midlayer" count={3} />
        <FilterItem label="Women's Hardshells" count={8} />
      </FilterItem>
    </div>
  );
};

export default FilterSidebar;

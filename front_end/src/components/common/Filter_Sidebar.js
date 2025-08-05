import React, { useState, useEffect } from "react";
import { Spinner, Alert } from "react-bootstrap";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import FilterItem from "./FilterItem"; // Import component con

const FilterSidebar = ({ onFilterChange, selectedFilters }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Removed duplicate state declaration for selectedFilters and setSelectedFilters

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios_instance.get(URL.EQUIPMENT_CATEGORIES);
        if (response.data.status) {
          setCategories(response.data.data);
        } else {
          setError("Không thể tải danh mục.");
        }
      } catch (err) {
        setError("Không thể tải danh mục. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Handling function when an item is selected
  // Hàm xử lý khi một item được chọn
  const handleItemCheck = (key, value, isChecked) => {
    let newFilters = { ...selectedFilters };

    if (key === "category_id") {
      const category = categories.find((cat) => cat.category_id === value);
      const subCategories = category
        ? category.children.map((child) => child.name)
        : [];
      if (isChecked) {
        // Add category_id
        if (!newFilters.category_id.includes(value)) {
          newFilters.category_id.push(value);
        }
        // Add all sub-categories
        subCategories.forEach((sub) => {
          if (!newFilters.sub_category.includes(sub)) {
            newFilters.sub_category.push(sub);
          }
        });
      } else {
        // Remove category_id
        newFilters.category_id = newFilters.category_id.filter(
          (id) => id !== value
        );
        // Remove all sub-categories
        newFilters.sub_category = newFilters.sub_category.filter(
          (sub) => !subCategories.includes(sub)
        );
      }
    } else if (key === "sub_category") {
      if (isChecked) {
        newFilters.sub_category.push(value);
      } else {
        newFilters.sub_category = newFilters.sub_category.filter(
          (item) => item !== value
        );
      }
    }

    // Send the filter updated to the parent component
    const formattedFilters = {
      category_id:
        newFilters.category_id.length > 0
          ? newFilters.category_id.join(",")
          : null,
      sub_category:
        newFilters.sub_category.length > 0
          ? newFilters.sub_category.join(",")
          : null,
    };
    onFilterChange(formattedFilters, newFilters);
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h5 style={{ fontWeight: "bold", color: "white", fontSize: "1.2rem" }}>
        CATEGORIES
      </h5>
      {categories.map((category) => (
        <FilterItem
          key={category.category_id}
          label={category.category_name}
          count={category.equipment_count}
          childrenData={category.children}
          onCheck={(isChecked) =>
            handleItemCheck("category_id", category.category_id, isChecked)
          }
          isChecked={selectedFilters.category_id.includes(category.category_id)}
          shouldOpen={category.children.some((child) =>
            selectedFilters.sub_category.includes(child.name)
          )}
          isParent={true}>
          {category.children.map((children, index) => (
            <FilterItem
              key={`${category.category_id}-${index}`}
              label={children.name}
              count={children.equipment_count}
              onCheck={(isChecked) =>
                handleItemCheck("sub_category", children.name, isChecked)
              }
              isChecked={selectedFilters.sub_category.includes(children.name)}
              isParent={false}
            />
          ))}
        </FilterItem>
      ))}
    </div>
  );
};

export default FilterSidebar;

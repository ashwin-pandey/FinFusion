import React, { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import { Category } from '../types';
import './Categories.css';

const Categories: React.FC = () => {
  const { categories, incomeCategories, expenseCategories, isLoading, createCategory, updateCategory, deleteCategory, fetchCategories } = useCategories(undefined, false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    icon: '📝',
    color: '#667eea',
    parentCategoryId: '',
  });

  const commonIcons = ['💰', '💵', '💸', '🍽️', '🚗', '🏠', '🎬', '⚡', '🏥', '📚', '✈️', '🛍️', '💄', '🏃', '🎁', '📋', '💻', '📱', '🔧', '☕'];
  const commonColors = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#FFC107', '#E91E63', '#3F51B5', '#8BC34A', '#FF5722', '#607D8B'];

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    if (!formData.type) {
      alert('Please select a category type');
      return;
    }
    
    if (!formData.icon) {
      alert('Please select an icon');
      return;
    }
    
    if (!formData.color) {
      alert('Please select a color');
      return;
    }
    
    try {
      console.log('Submitting category:', formData);
      
      if (editingCategory) {
        console.log('Updating category:', editingCategory.id);
        await updateCategory(editingCategory.id, {
          ...formData,
          parentCategoryId: formData.parentCategoryId || undefined,
        });
      } else {
        console.log('Creating new category');
        await createCategory({
          ...formData,
          parentCategoryId: formData.parentCategoryId || undefined,
        });
      }
      resetForm();
      // Don't call fetchCategories() - the Redux action already updates the state
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || '📝',
      color: category.color || '#667eea',
      parentCategoryId: category.parentCategoryId || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, category: Category) => {
    if (category.isSystem) {
      alert('Cannot delete system categories');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This will also delete all subcategories and associated transactions.`)) {
      try {
        await deleteCategory(id);
        // Don't call fetchCategories() - the Redux action already updates the state
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      type: 'EXPENSE',
      icon: '📝',
      color: '#667eea',
      parentCategoryId: '',
    });
  };

  const getDisplayCategories = () => {
    if (activeTab === 'INCOME') return incomeCategories;
    if (activeTab === 'EXPENSE') return expenseCategories;
    return categories;
  };

  const parentCategories = categories.filter(
    (c) => !c.parentCategoryId && c.type === formData.type
  );

  const displayCategories = getDisplayCategories();

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Category
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          All ({categories.length})
        </button>
        <button
          className={`tab ${activeTab === 'INCOME' ? 'active' : ''}`}
          onClick={() => setActiveTab('INCOME')}
        >
          Income ({incomeCategories.length})
        </button>
        <button
          className={`tab ${activeTab === 'EXPENSE' ? 'active' : ''}`}
          onClick={() => setActiveTab('EXPENSE')}
        >
          Expenses ({expenseCategories.length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="categories-container">
        {isLoading ? (
          <div className="loading">Loading categories...</div>
        ) : displayCategories.length === 0 ? (
          <div className="empty-state">
            <p>No categories found</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Create your first category
            </button>
          </div>
        ) : (
          <div className="categories-grid">
            {displayCategories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                style={{ borderLeftColor: category.color }}
              >
                <div className="category-header">
                  <div className="category-title">
                    <span className="category-icon" style={{ fontSize: '24px' }}>
                      {category.icon}
                    </span>
                    <div>
                      <h3>{category.name}</h3>
                      {category.parentCategory && (
                        <p className="subcategory-of">
                          Subcategory of {category.parentCategory.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="category-actions">
                    {!category.isSystem && (
                      <>
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(category)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDelete(category.id, category)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="category-info">
                  <span className={`badge badge-${category.type.toLowerCase()}`}>
                    {category.type}
                  </span>
                  {category.isSystem && <span className="badge badge-system">System</span>}
                </div>

                {/* Subcategories */}
                {category.subCategories && category.subCategories.length > 0 && (
                  <div className="subcategories">
                    <p className="subcategories-title">Subcategories:</p>
                    <div className="subcategories-list">
                      {category.subCategories.map((sub) => (
                        <span key={sub.id} className="subcategory-tag">
                          {sub.icon} {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Groceries"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any, parentCategoryId: '' })}
                    required
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Parent Category (Optional)</label>
                <select
                  value={formData.parentCategoryId}
                  onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value })}
                >
                  <option value="">None (Top Level)</option>
                  {parentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Icon</label>
                <div className="icon-picker">
                  {commonIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Or enter custom emoji"
                  maxLength={2}
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {commonColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

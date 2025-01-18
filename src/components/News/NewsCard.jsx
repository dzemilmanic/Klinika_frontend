import React from "react";
import { Pencil, Trash2 } from "lucide-react";


const NewsCard = ({ id, title, content, publishedDate, isAdmin, onEdit, onDelete }) => (
  <div className="news-card">
    <div className="news-card-header">
      <h3>{title}</h3>
      {isAdmin && (
        <div className="news-card-actions">
          <button
            className="icon-button"
            title="Ažuriraj vest"
            onClick={() => onEdit(id)}
          >
            <Pencil size={18} className="text-blue-500 hover:text-blue-700" />
          </button>
          <button
            className="icon-button"
            title="Izbriši vest"
            onClick={() => onDelete(id)}
          >
            <Trash2 size={18} className="text-red-500 hover:text-red-700" />
          </button>
        </div>
      )}
    </div>
    <p>{content}</p>
    <small>{new Date(publishedDate).toLocaleDateString()}</small>
  </div>
);

export default NewsCard;
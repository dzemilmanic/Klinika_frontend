import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NewsCard from './NewsCard';

describe('NewsCard komponenta', () => {
  const defaultProps = {
    id: 1,
    title: 'Test naslov',
    content: 'Ovo je test sadržaj.',
    publishedDate: '2025-07-06T12:00:00Z',
    isAdmin: false,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  test('prikazuje naslov, sadržaj i datum', () => {
    render(<NewsCard {...defaultProps} />);
    
    expect(screen.getByText('Test naslov')).toBeInTheDocument();
    expect(screen.getByText('Ovo je test sadržaj.')).toBeInTheDocument();
    expect(screen.getByText('6. 7. 2025.')).toBeInTheDocument();
  });

  test('ne prikazuje dugmiće za izmenu i brisanje ako nije admin', () => {
    render(<NewsCard {...defaultProps} />);
    
    expect(screen.queryByTitle('Ažuriraj vest')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Izbriši vest')).not.toBeInTheDocument();
  });

  test('prikazuje dugmiće i poziva onEdit/onDelete kada je admin', () => {
    render(<NewsCard {...defaultProps} isAdmin={true} />);
    
    const editButton = screen.getByTitle('Ažuriraj vest');
    const deleteButton = screen.getByTitle('Izbriši vest');

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(1);

    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(1);
  });
});

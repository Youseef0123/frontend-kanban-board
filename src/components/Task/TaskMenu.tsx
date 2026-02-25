'use client';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useUIStore } from '@/store/uiStore';
import type { Task } from '@/types/task';

interface TaskMenuProps {
  task: Task;
  anchorEl: HTMLElement | null;
  onOpen: (el: HTMLElement) => void;
  onClose: () => void;
}

export default function TaskMenu({ task, anchorEl, onOpen, onClose }: TaskMenuProps) {
  const openModal = useUIStore((s) => s.openModal);

  const handleEdit = () => {
    onClose();
    openModal({ type: 'edit', task });
  };

  const handleDelete = () => {
    onClose();
    openModal({ type: 'delete', task });
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label="task options"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(e.currentTarget);
        }}
        sx={{ p: 0.25, color: 'text.secondary' }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        elevation={2}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 140 } }}
      >
        <MenuItem onClick={handleEdit} dense>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} dense sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

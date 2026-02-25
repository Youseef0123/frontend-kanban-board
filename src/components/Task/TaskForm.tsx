"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { useUIStore } from "@/store/uiStore";
import { useCreateTask, useUpdateTask } from "@/hooks/useTaskMutations";
import type { Priority, ColumnId } from "@/types/task";

const TITLE_MAX = 80;
const DESC_MAX = 300;

interface TaskFormValues {
  title: string;
  description: string;
  priority: Priority;
}


export default function TaskForm() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const showSnackbar = useUIStore((s) => s.showSnackbar);

  const isCreateMode = activeModal?.type === "create";
  const isEditMode = activeModal?.type === "edit";
  const isOpen = isCreateMode || isEditMode;

  const editTask = isEditMode ? activeModal.task : undefined;
  const targetColumn: ColumnId = isCreateMode
    ? activeModal.column
    : (editTask?.column ?? "backlog");

  const createTask = useCreateTask(searchQuery);
  const updateTask = useUpdateTask(searchQuery);

  const isLoading = createTask.isPending || updateTask.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
    },
  });

  const titleValue = watch("title") ?? "";
  const descValue = watch("description") ?? "";

  useEffect(() => {
    if (isEditMode && editTask) {
      reset({
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
      });
    } else if (isCreateMode) {
      reset({ title: "", description: "", priority: "medium" });
    }
  }, [isEditMode, isCreateMode, editTask, reset]);

  const onSubmit = async (values: TaskFormValues) => {
    if (isCreateMode) {
      await createTask.mutateAsync({
        ...values,
        column: targetColumn,
        order: Date.now(),
      });
      showSnackbar("Task created successfully");
    } else if (isEditMode && editTask) {
      await updateTask.mutateAsync({ id: editTask.id, payload: values });
      showSnackbar("Task updated successfully");
    }
    closeModal();
  };

  return (
    <Dialog open={isOpen} onClose={closeModal} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isCreateMode ? "New Task" : "Edit Task"}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            autoFocus
            error={!!errors.title}
            helperText={errors.title?.message}
            inputProps={{
              maxLength: TITLE_MAX,
              style: { fontFamily: "monospace" },
            }}
            {...register("title", { required: "Title is required" })}
          />
          {/* Character counter below title */}
          <Typography
            variant="caption"
            color={titleValue.length >= TITLE_MAX ? "error" : "text.secondary"}
            display="block"
            textAlign="right"
            mt={-1}
            mb={0.5}
          >
            {titleValue.length} / {TITLE_MAX}
          </Typography>

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            error={!!errors.description}
            helperText={errors.description?.message}
            inputProps={{ maxLength: DESC_MAX }}
            {...register("description")}
          />
          {/* Character counter below description */}
          <Typography
            variant="caption"
            color={descValue.length >= DESC_MAX ? "error" : "text.secondary"}
            display="block"
            textAlign="right"
            mt={-1}
            mb={0.5}
          >
            {descValue.length} / {DESC_MAX}
          </Typography>

          <FormControl fullWidth margin="normal" error={!!errors.priority}>
            <InputLabel id="priority-label">Priority</InputLabel>
            <Controller
              name="priority"
              control={control}
              rules={{ required: "Priority is required" }}
              render={({ field }) => (
                <Select labelId="priority-label" label="Priority" {...field}>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              )}
            />
            {errors.priority && (
              <FormHelperText>{errors.priority.message}</FormHelperText>
            )}
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeModal} disabled={isLoading} color="inherit">
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={isLoading}
            variant="contained"
            // Disable when title is blank so the user gets immediate visual feedback
            disabled={isLoading || titleValue.trim().length === 0}
          >
            {isCreateMode ? "Create" : "Save changes"}
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { addUser, getSingleUser, updateUser } from "../lib/apis/queries";

export const useUserForm = (id?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Fetch single user for editing
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getSingleUser(id!),
    enabled: isEditMode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (values: any) => addUser(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-data"] });
      navigate("/user/list");
    },
    onError: () => {},
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: (values: any) => updateUser(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-data"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      navigate("/user/list");
    },
    onError: () => {},
  });

  return {
    userData,
    isLoadingUser,
    userError,
    createMutation,
    updateMutation,
    isEditMode,
  };
};

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfileAction,
  updateProfileAction,
  changePasswordAction,
  getCompanyAction,
  updateCompanyAction,
  listMembersAction,
  inviteMemberAction,
  removeMemberAction,
} from "@/modules/settings/actions/settings.actions";
import type {
  ProfileInput,
  PasswordChangeInput,
  CompanyInput,
  InviteMemberInput,
} from "@/modules/settings/schemas/settings.schema";

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: () => getProfileAction() });
}
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileInput) => updateProfileAction(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: PasswordChangeInput) => changePasswordAction(data),
  });
}

export function useCompany() {
  return useQuery({ queryKey: ["company"], queryFn: () => getCompanyAction() });
}
export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CompanyInput) => updateCompanyAction(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company"] }),
  });
}

export function useMembers() {
  return useQuery({ queryKey: ["members"], queryFn: () => listMembersAction() });
}
export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteMemberInput) => inviteMemberAction(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });
}
export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeMemberAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });
}

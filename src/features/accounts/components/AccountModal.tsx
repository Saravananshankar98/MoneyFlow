import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { View } from "react-native";
import {
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";

import { useAccountStore } from "../../../store";
import { Account } from "../types/account";
import {
  accountSchema,
  AccountForm,
} from "../validation/accountSchema";

interface Props {
  visible: boolean;
  account?: Account | null;
  onDismiss: () => void;
}

export default function AccountModal({
  visible,
  account,
  onDismiss,
}: Props) {
  const { addAccount, updateAccount } = useAccountStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      balance: 0,
      color: "#2563EB",
      type: "Savings",
    },
  });

  useEffect(() => {
    if (account) {
      reset({
        name: account.name,
        balance: account.balance,
        color: account.color,
        type: account.type,
      });
    } else {
      reset({
        name: "",
        balance: 0,
        color: "#2563EB",
        type: "Savings",
      });
    }
  }, [account, reset]);

  const onSubmit = async (data: AccountForm) => {
    if (account) {
      await updateAccount({
        ...account,
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await addAccount({
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    reset();

    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: "white",
          padding: 20,
          margin: 20,
          borderRadius: 20,
        }}
      >
        <Text
          variant="headlineSmall"
          style={{ marginBottom: 20 }}
        >
          {account ? "Edit Account" : "Add Account"}
        </Text>

        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextInput
              mode="outlined"
              label="Account Name"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        {errors.name && (
          <Text style={{ color: "red", marginTop: 4 }}>
            {errors.name.message}
          </Text>
        )}

        <View style={{ height: 16 }} />

        <Controller
          control={control}
          name="balance"
          render={({ field }) => (
            <TextInput
              mode="outlined"
              label="Opening Balance"
              keyboardType="numeric"
              value={String(field.value)}
              onChangeText={(text) =>
                field.onChange(Number(text) || 0)
              }
            />
          )}
        />

        <View style={{ height: 24 }} />

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
        >
          {account ? "Update Account" : "Save Account"}
        </Button>
      </Modal>
    </Portal>
  );
}
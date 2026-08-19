import { useEffect, useState } from "react";

import {
  Controller,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import { Picker } from "../../../shared/components/inputs/PaperPicker";

import {
  DatePickerModal,
  TimePickerModal,
} from "react-native-paper-dates";

import { useAccountStore } from "../../../store/accountStore";

import {
  useTransactionStore,
} from "../../../store/transactionStore";

import {
  useNotificationStore,
} from "../../../store/notificationStore";

import {
  transferSchema,
  type TransferForm,
} from "../validation/transactionSchema";

import type {
  Transaction,
} from "../types/transaction";
import {
  getAvailableLimit,
  getOutstanding,
} from "../../accounts/utils/creditCard";

interface Props {
  visible: boolean;

  transaction?:
    | Transaction
    | null;

  onDismiss: () => void;
}

const DEFAULT_FORM_VALUES: TransferForm =
  {
    amount: 0,

    details: "Transfer",

    accountId: "",

    toAccountId: "",

    notes: "",

    date: new Date().toISOString(),
  };

export default function TransferModal({
  visible,

  transaction,

  onDismiss,
}: Props) {
  const theme = useTheme();

  const {
    showNotification,
  } = useNotificationStore();

  // ========================================
  // DATE / TIME PICKER STATE
  // ========================================

  const [
    datePickerVisible,
    setDatePickerVisible,
  ] = useState(false);

  const [
    timePickerVisible,
    setTimePickerVisible,
  ] = useState(false);

  // ========================================
  // ACCOUNT STORE
  // ========================================

  const {
    accounts,

    loadAccounts,
  } = useAccountStore();

  // ========================================
  // TRANSACTION STORE
  // ========================================

  const {
    addTransaction,

    updateTransaction,
  } =
    useTransactionStore();

  // ========================================
  // FORM
  // ========================================

  const {
    control,

    handleSubmit,

    reset,

    setValue,

    watch,

    formState: {
      errors,
    },
  } =
    useForm<TransferForm>({
      resolver:
        zodResolver(
          transferSchema
        ),

      defaultValues:
        DEFAULT_FORM_VALUES,
    });

  // ========================================
  // WATCH DATE
  // ========================================

  const selectedDateValue =
    watch("date");

  const selectedDate =
    selectedDateValue
      ? new Date(
          selectedDateValue
        )
      : new Date();

  // ========================================
  // LOAD ACCOUNTS / EDIT DATA
  // ========================================

  useEffect(() => {
    if (!visible) {
      return;
    }

    loadAccounts();

    // ======================================
    // EDIT MODE
    // ======================================

    if (transaction) {
      reset({
        amount:
          transaction.amount,

        details:
          transaction.details ||
          "Transfer",

        accountId:
          transaction.accountId,

        toAccountId:
          transaction.toAccountId ??
          "",

        notes:
          transaction.notes ??
          "",

        date:
          transaction.date ||
          new Date().toISOString(),
      });

      return;
    }

    // ======================================
    // ADD MODE
    // ======================================

    reset({
      ...DEFAULT_FORM_VALUES,

      date:
        new Date().toISOString(),
    });
  }, [
    visible,

    transaction,

    reset,

    loadAccounts,
  ]);

  // ========================================
  // DATE CONFIRM
  // ========================================

  const handleDateConfirm = ({
    date,
  }: {
    date: Date | undefined;
  }) => {
    setDatePickerVisible(false);

    if (!date) {
      return;
    }

    const current =
      new Date(
        selectedDate
      );

    const updated =
      new Date(date);

    // Keep current time
    updated.setHours(
      current.getHours()
    );

    updated.setMinutes(
      current.getMinutes()
    );

    updated.setSeconds(
      current.getSeconds()
    );

    updated.setMilliseconds(
      0
    );

    setValue(
      "date",
      updated.toISOString(),
      {
        shouldDirty: true,

        shouldValidate: true,
      }
    );
  };

  // ========================================
  // TIME CONFIRM
  // ========================================

  const handleTimeConfirm = ({
    hours,

    minutes,
  }: {
    hours: number;

    minutes: number;
  }) => {
    setTimePickerVisible(false);

    const updated =
      new Date(
        selectedDate
      );

    updated.setHours(hours);

    updated.setMinutes(minutes);

    updated.setSeconds(0);

    updated.setMilliseconds(0);

    setValue(
      "date",
      updated.toISOString(),
      {
        shouldDirty: true,

        shouldValidate: true,
      }
    );
  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (
    date: Date
  ) => {
    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",

        month: "2-digit",

        year: "numeric",
      }
    );
  };

  // ========================================
  // FORMAT TIME
  // ========================================

  const formatTime = (
    date: Date
  ) => {
    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",

        minute: "2-digit",

        hour12: true,
      }
    );
  };

  // ========================================
  // SUBMIT
  // ========================================

  const onSubmit = async (
    data: TransferForm
  ) => {
    const now =
      new Date().toISOString();

    // ======================================
    // SAME ACCOUNT CHECK
    // ======================================

    if (
      data.accountId ===
      data.toAccountId
    ) {
      showNotification(
        "From Account and To Account must be different.",
        "error"
      );

      return;
    }

    // ======================================
    // SOURCE ACCOUNT
    // ======================================

    const sourceAccount =
      accounts.find(
        (account) =>
          account.id ===
          data.accountId
      );

    if (!sourceAccount) {
      showNotification(
        "Please select a From Account.",
        "error"
      );

      return;
    }

    // ======================================
    // DESTINATION ACCOUNT
    // ======================================

    const destinationAccount =
      accounts.find(
        (account) =>
          account.id ===
          data.toAccountId
      );

    if (!destinationAccount) {
      showNotification(
        "Please select a To Account.",
        "error"
      );

      return;
    }

    // ======================================
    // AMOUNT CHECK
    // ======================================

    if (
      data.amount <= 0
    ) {
      showNotification(
        "Amount must be greater than zero.",
        "error"
      );

      return;
    }

    // ======================================
    // ADD / EDIT PAYLOAD
    // ======================================

    const payload: Transaction =
      {
        id:
          transaction?.id ??
          Date.now().toString(),

        type: "transfer",

        amount:
          data.amount,

        details:
          data.details ||
          "Transfer",

        accountId:
          data.accountId,

        toAccountId:
          data.toAccountId,

        notes:
          data.notes,

        date:
          data.date,

        createdAt:
          transaction?.createdAt ??
          now,

        updatedAt:
          now,
      };

    // ======================================
    // SAVE
    // ======================================

    const result =
      transaction
        ? await updateTransaction(
            payload
          )
        : await addTransaction(
            payload
          );

    // ======================================
    // ERROR
    // ======================================

    if (!result.success) {
      showNotification(
        result.error ??
          "Unable to save transfer.",
        "error"
      );

      return;
    }

    // ======================================
    // SUCCESS
    // ======================================

    await loadAccounts();

    reset(
      DEFAULT_FORM_VALUES
    );

    setDatePickerVisible(
      false
    );

    setTimePickerVisible(
      false
    );

    onDismiss();

    showNotification(
      transaction
        ? "Transfer updated successfully."
        : "Transfer saved successfully.",
      "success"
    );
  };

  // ========================================
  // DISMISS
  // ========================================

  const handleDismiss = () => {
    setDatePickerVisible(
      false
    );

    setTimePickerVisible(
      false
    );

    reset(
      DEFAULT_FORM_VALUES
    );

    onDismiss();
  };

  // ========================================
  // ACCOUNT PICKER
  // ========================================

  const renderAccountPicker = (
    field: {
      value: string;

      onChange: (
        value: string | number
      ) => void;
    },

    label: string,

    excludeAccountId?: string
  ) => (
    <View
      style={
        styles.pickerContainer
      }
    >
      <Text
        style={
          styles.pickerLabel
        }
      >
        {label}
      </Text>

      <Picker
        selectedValue={
          field.value
        }
        onValueChange={
          field.onChange
        }
      >
        <Picker.Item
          label="Select account"
          value=""
        />

        {accounts
          .filter(
            (account) =>
              account.id !==
              excludeAccountId
          )
          .map(
            (account) => (
              <Picker.Item
                key={
                  account.id
                }
                label={
                  account.type ===
                  "Credit Card"
                    ? `${account.name} - outstanding ₹${getOutstanding(
                        account
                      ).toLocaleString(
                        "en-IN"
                      )}, available ₹${getAvailableLimit(
                        account
                      ).toLocaleString(
                        "en-IN"
                      )}`
                    : `${account.name} - ₹${account.balance.toLocaleString(
                        "en-IN"
                      )}`
                }
                value={
                  account.id
                }
              />
            )
          )}
      </Picker>
    </View>
  );

  // ========================================
  // UI
  // ========================================

  return (
    <Portal>
      {/* ================================== */}
      {/* MODAL */}
      {/* ================================== */}

      <Modal
        visible={visible}
        onDismiss={
          handleDismiss
        }
        contentContainerStyle={[
          styles.modal,

          {
            backgroundColor:
              theme.colors.surface,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* ============================== */}
          {/* TITLE */}
          {/* ============================== */}

          <Text
            variant="headlineSmall"
            style={styles.title}
          >
            {transaction
              ? "Edit Transfer"
              : "Transfer Money"}
          </Text>

          {/* ============================== */}
          {/* DATE + TIME */}
          {/* ============================== */}

          <View
            style={
              styles.dateTimeRow
            }
          >
            {/* DATE */}

            <View
              style={
                styles.dateTimeItem
              }
            >
              <TextInput
                mode="outlined"
                label="Date"
                value={formatDate(
                  selectedDate
                )}
                editable={false}
                right={
                  <TextInput.Icon
                    icon="calendar"
                    onPress={() =>
                      setDatePickerVisible(
                        true
                      )
                    }
                  />
                }
                onPressIn={() =>
                  setDatePickerVisible(
                    true
                  )
                }
              />
            </View>

            {/* TIME */}

            <View
              style={
                styles.dateTimeItem
              }
            >
              <TextInput
                mode="outlined"
                label="Time"
                value={formatTime(
                  selectedDate
                )}
                editable={false}
                right={
                  <TextInput.Icon
                    icon="clock-outline"
                    onPress={() =>
                      setTimePickerVisible(
                        true
                      )
                    }
                  />
                }
                onPressIn={() =>
                  setTimePickerVisible(
                    true
                  )
                }
              />
            </View>
          </View>

          {/* ============================== */}
          {/* AMOUNT */}
          {/* ============================== */}

          <Controller
            control={control}
            name="amount"
            render={({
              field,
            }) => (
              <TextInput
                mode="outlined"
                label="Amount"
                placeholder="0"
                keyboardType="numeric"
                value={
                  field.value ===
                  0
                    ? ""
                    : String(
                        field.value
                      )
                }
                onChangeText={(
                  value
                ) => {
                  if (
                    value ===
                    ""
                  ) {
                    field.onChange(
                      0
                    );

                    return;
                  }

                  const amount =
                    Number(
                      value
                    );

                  field.onChange(
                    Number.isNaN(
                      amount
                    )
                      ? 0
                      : amount
                  );
                }}
              />
            )}
          />

          {errors.amount
            ?.message && (
            <Text
              style={
                styles.error
              }
            >
              {
                errors.amount
                  .message
              }
            </Text>
          )}

          <View
            style={
              styles.spacing
            }
          />

          {/* ============================== */}
          {/* DETAILS */}
          {/* ============================== */}

          <Controller
            control={control}
            name="details"
            render={({
              field,
            }) => (
              <TextInput
                mode="outlined"
                label="Details"
                placeholder="Transfer"
                value={
                  field.value
                }
                onChangeText={
                  field.onChange
                }
              />
            )}
          />

          {errors.details
            ?.message && (
            <Text
              style={
                styles.error
              }
            >
              {
                errors.details
                  .message
              }
            </Text>
          )}

          <View
            style={
              styles.spacing
            }
          />

          {/* ============================== */}
          {/* FROM ACCOUNT */}
          {/* ============================== */}

          <Controller
            control={control}
            name="accountId"
            render={({
              field,
            }) =>
              renderAccountPicker(
                field,
                "From Account"
              )
            }
          />

          {errors.accountId
            ?.message && (
            <Text
              style={
                styles.error
              }
            >
              {
                errors.accountId
                  .message
              }
            </Text>
          )}

          <View
            style={
              styles.spacing
            }
          />

          {/* ============================== */}
          {/* TO ACCOUNT */}
          {/* ============================== */}

          <Controller
            control={control}
            name="toAccountId"
            render={({
              field,
            }) => {
              const fromAccountId =
                watch(
                  "accountId"
                );

              return renderAccountPicker(
                field,
                "To Account",
                fromAccountId
              );
            }}
          />

          {errors.toAccountId
            ?.message && (
            <Text
              style={
                styles.error
              }
            >
              {
                errors.toAccountId
                  .message
              }
            </Text>
          )}

          <View
            style={
              styles.spacing
            }
          />

          {/* ============================== */}
          {/* NOTES */}
          {/* ============================== */}

          <Controller
            control={control}
            name="notes"
            render={({
              field,
            }) => (
              <TextInput
                mode="outlined"
                label="Notes"
                placeholder="Optional"
                multiline
                numberOfLines={3}
                value={
                  field.value ??
                  ""
                }
                onChangeText={
                  field.onChange
                }
              />
            )}
          />

          {errors.notes
            ?.message && (
            <Text
              style={
                styles.error
              }
            >
              {
                errors.notes
                  .message
              }
            </Text>
          )}

          <View
            style={
              styles.buttonSpacing
            }
          />

          {/* ============================== */}
          {/* SAVE */}
          {/* ============================== */}

          <Button
            mode="contained"
            icon="swap-horizontal"
            onPress={handleSubmit(
              onSubmit
            )}
          >
            {transaction
              ? "Update Transfer"
              : "Save Transfer"}
          </Button>
        </ScrollView>
      </Modal>

      {/* ================================== */}
      {/* DATE PICKER */}
      {/* ================================== */}

      <DatePickerModal
        locale="en"
        mode="single"
        visible={
          datePickerVisible
        }
        date={selectedDate}
        onDismiss={() =>
          setDatePickerVisible(
            false
          )
        }
        onConfirm={
          handleDateConfirm
        }
      />

      {/* ================================== */}
      {/* TIME PICKER */}
      {/* ================================== */}

      <TimePickerModal
        visible={
          timePickerVisible
        }
        onDismiss={() =>
          setTimePickerVisible(
            false
          )
        }
        onConfirm={
          handleTimeConfirm
        }
        hours={
          selectedDate.getHours()
        }
        minutes={
          selectedDate.getMinutes()
        }
        label="Select time"
      />
    </Portal>
  );
}

// ========================================
// STYLES
// ========================================

const styles =
  StyleSheet.create({
    modal: {
      margin: 20,

      borderRadius: 20,

      maxHeight: "92%",
    },

    content: {
      padding: 20,

      paddingBottom: 30,
    },

    title: {
      marginBottom: 20,

      fontWeight: "600",
    },

    dateTimeRow: {
      flexDirection: "row",

      gap: 12,

      marginBottom: 16,
    },

    dateTimeItem: {
      flex: 1,
    },

    spacing: {
      height: 16,
    },

    buttonSpacing: {
      height: 24,
    },

    error: {
      color: "#D32F2F",

      marginTop: 4,
    },

    pickerContainer: {
      borderWidth: 1,

      borderColor: "#79747E",

      borderRadius: 4,

      overflow: "hidden",
    },

    pickerLabel: {
      paddingHorizontal: 12,

      paddingTop: 8,

      fontSize: 12,

      color: "#49454F",
    },
  });

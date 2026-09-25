import { useEffect, useState } from "react";

import {
  Controller,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  KeyboardAvoidingView,
  Platform,
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

import * as DocumentPicker from "expo-document-picker";

import {
  DatePickerModal,
  TimePickerModal,
} from "react-native-paper-dates";

import { useAccountStore } from "../../../store/accountStore";

import {
  useTransactionStore,
} from "../../../store/transactionStore";

import {
  useCategoryStore,
} from "../../../store/categoryStore";

import {
  useNotificationStore,
} from "../../../store/notificationStore";
import { checkFinancialReminders } from "../../../services/reminderService";


import {
  expenseSchema,
  type ExpenseForm,
} from "../validation/transactionSchema";

import type {
  PaymentType,
  Transaction,
} from "../types/transaction";
import CategoryPicker from "../../categories/components/CategoryPickerModal";

interface Props {
  visible: boolean;

  transaction?:
    | Transaction
    | null;

  onDismiss: () => void;
}

const DEFAULT_FORM_VALUES: ExpenseForm =
  {
    amount: 0,

    details: "",

    accountId: "",

    paymentType: "",

    category: "",

    notes: "",

    attachmentUri: "",

    attachmentName: "",

    date: new Date().toISOString(),
  };

export default function ExpenseModal({
  visible,

  transaction,

  onDismiss,
}: Props) {
  const theme = useTheme();

  // ========================================
  // PICKER STATE
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
  // STORES
  // ========================================

  const {
    accounts,
    loadAccounts,
  } = useAccountStore();

  const {
    addTransaction,
    updateTransaction,
  } =
    useTransactionStore();

  const {
    loadCategories,
  } =
    useCategoryStore();

  const {
    showNotification,
  } = useNotificationStore();

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
    useForm<ExpenseForm>({
      resolver:
        zodResolver(
          expenseSchema
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
  // LOAD DATA
  // ========================================

  useEffect(() => {
    if (!visible) {
      return;
    }

    loadAccounts();

    loadCategories();

    // ======================================
    // EDIT
    // ======================================

    if (transaction) {
      reset({
        amount:
          transaction.amount,

        details:
          transaction.details,

        accountId:
          transaction.accountId,

        paymentType:
          transaction.paymentType ??
          "",

        category:
          transaction.category ??
          "",

        notes:
          transaction.notes ??
          "",

        attachmentUri:
          transaction.attachmentUri ??
          "",

        attachmentName:
          transaction.attachmentName ??
          "",

        date:
          transaction.date ||
          new Date().toISOString(),
      });

      return;
    }

    // ======================================
    // ADD
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
    loadCategories,
  ]);

  // ========================================
  // DATE PICKER
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

    /*
     * Keep existing time
     */
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
  // TIME PICKER
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

    updated.setHours(
      hours
    );

    updated.setMinutes(
      minutes
    );

    updated.setSeconds(
      0
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
  // FORMAT DATE
  // ========================================

  const formatDate =
    (date: Date) => {
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

  const formatTime =
    (date: Date) => {
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
    data: ExpenseForm
  ) => {
    try {
      // ====================================
      // EDIT
      // ====================================

      if (transaction) {
        const result =
          await updateTransaction({
          ...transaction,

          type: "expense",

          amount:
            data.amount,

          details:
            data.details,

          accountId:
            data.accountId,

          paymentType:
            data.paymentType as PaymentType,

          category:
            data.category,

          notes:
            data.notes,

          attachmentUri:
            data.attachmentUri,

          attachmentName:
            data.attachmentName,

          date:
            data.date,

          updatedAt:
            new Date().toISOString(),
          });

        if (!result.success) {
          showNotification(
            result.error ??
              "Unable to update expense.",
            "error"
          );

          return;
        }

        await loadAccounts();
        await checkFinancialReminders();

        reset(
          DEFAULT_FORM_VALUES
        );

        onDismiss();

        showNotification(
          "Expense updated successfully.",
          "success"
        );

        return;
      }

      // ====================================
      // ADD
      // ====================================

      const result =
        await addTransaction({
          id:
            Date.now().toString(),

          type: "expense",

          amount:
            data.amount,

          details:
            data.details,

          accountId:
            data.accountId,

          paymentType:
            data.paymentType as PaymentType,

          category:
            data.category,

          notes:
            data.notes,

          attachmentUri:
            data.attachmentUri,

          attachmentName:
            data.attachmentName,

          date:
            data.date,

          createdAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),
        });

      if (!result.success) {
        showNotification(
          result.error ??
            "Unable to save expense.",
          "error"
        );

        return;
      }

      await loadAccounts();
      await checkFinancialReminders();

      reset(
        DEFAULT_FORM_VALUES
      );

      onDismiss();

      showNotification(
        "Expense saved successfully.",
        "success"
      );
    } catch (error) {
      console.error(
        "Expense submit error:",
        error
      );

      showNotification(
        "Something went wrong while saving the expense.",
        "error"
      );
    }
  };

  // ========================================
  // ATTACHMENT
  // ========================================

  const handlePickAttachment =
    async () => {
      try {
        const result =
          await DocumentPicker.getDocumentAsync(
            {
              copyToCacheDirectory:
                true,

              multiple: false,
            }
          );

        if (
          result.canceled
        ) {
          return;
        }

        const asset =
          result.assets?.[0];

        if (!asset) {
          return;
        }

        setValue(
          "attachmentUri",
          asset.uri,
          {
            shouldDirty: true,
          }
        );

        setValue(
          "attachmentName",
          asset.name,
          {
            shouldDirty: true,
          }
        );
      } catch (error) {
        console.error(
          "Attachment error:",
          error
        );

        showNotification(
          "Unable to select attachment.",
          "error"
        );
      }
    };

  const attachmentName =
    watch(
      "attachmentName"
    );

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
  // UI
  // ========================================

  return (
    <Portal>
      {/* ================================== */}
      {/* EXPENSE MODAL */}
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoidingView}
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
              ? "Edit Expense"
              : "Add Expense"}
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
                placeholder="Breakfast"
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
          {/* ACCOUNT */}
          {/* ============================== */}

          <Controller
            control={control}
            name="accountId"
            render={({
              field,
            }) => (
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
                  Account
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

                  {accounts.filter((account) => !account.isArchived).map(
                    (
                      account
                    ) => (
                      <Picker.Item
                        key={
                          account.id
                        }
                        label={`${account.name} - ${account.type}`}
                        value={
                          account.id
                        }
                      />
                    )
                  )}
                </Picker>
              </View>
            )}
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
          {/* PAYMENT TYPE */}
          {/* ============================== */}

          <Controller
            control={control}
            name="paymentType"
            render={({
              field,
            }) => (
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
                  Payment Type
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
                    label="Select payment type"
                    value=""
                  />

                  <Picker.Item
                    label="Cash"
                    value="Cash"
                  />

                  <Picker.Item
                    label="UPI"
                    value="UPI"
                  />

                  <Picker.Item
                    label="Debit Card"
                    value="Debit Card"
                  />

                  <Picker.Item
                    label="Credit Card"
                    value="Credit Card"
                  />

                  <Picker.Item
                    label="Net Banking"
                    value="Net Banking"
                  />

                  <Picker.Item
                    label="Cheque"
                    value="Cheque"
                  />

                  <Picker.Item
                    label="Wallet"
                    value="Wallet"
                  />
                </Picker>
              </View>
            )}
          />

          {errors.paymentType
            ?.message && (
            <Text
              style={
                styles.error
              }
            >
              {
                errors
                  .paymentType
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
          {/* CATEGORY */}
          {/* ============================== */}

          <Text
            variant="labelLarge"
            style={
              styles.fieldLabel
            }
          >
            Category
          </Text>

          <Controller
            control={control}
            name="category"
            render={({
              field,
            }) => (
              <CategoryPicker
                value={
                  field.value ??
                  ""
                }
                onChange={
                  field.onChange
                }
                error={
                  errors.category
                    ?.message
                }
                type="expense"
              />
            )}
          />

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
              styles.spacing
            }
          />

          {/* ============================== */}
          {/* ATTACHMENT */}
          {/* ============================== */}

          <Button
            mode="outlined"
            icon="paperclip"
            onPress={
              handlePickAttachment
            }
          >
            {attachmentName
              ? attachmentName
              : "Add Attachment"}
          </Button>

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
            contentStyle={styles.submitButtonContent}
            onPress={handleSubmit(
              onSubmit
            )}
          >
            {transaction
              ? "Update Expense"
              : "Save Expense"}
          </Button>
        </ScrollView>
        </KeyboardAvoidingView>
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
      width: "92%",
      maxWidth: 560,
      maxHeight: "88%",
      alignSelf: "center",
      borderRadius: 24,
      overflow: "hidden",
    },

    keyboardAvoidingView: {
      flexShrink: 1,
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

    fieldLabel: {
      color: "#49454F",

      marginBottom: 6,
    },

    pickerContainer: {
      borderWidth: 1,

      borderColor:
        "#79747E",

      borderRadius: 4,

      overflow: "hidden",
    },

    pickerLabel: {
      paddingHorizontal: 12,

      paddingTop: 8,

      fontSize: 12,

      color: "#49454F",
    },

    submitButtonContent: {
      minHeight: 48,
    },
  });

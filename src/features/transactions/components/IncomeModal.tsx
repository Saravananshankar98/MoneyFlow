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
  TouchableRipple,
} from "react-native-paper";

import { Picker } from "@react-native-picker/picker";

import { useAccountStore } from "../../../store/accountStore";
import { useCategoryStore } from "../../../store/categoryStore";
import { useTransactionStore } from "../../../store/transactionStore";

import CategoryPickerModal from "../../categories/components/CategoryPickerModal";

import {
  incomeSchema,
  type IncomeForm,
} from "../validation/transactionSchema";

import type { Transaction } from "../types/transaction";

interface Props {
  visible: boolean;
  transaction?: Transaction | null;
  onDismiss: () => void;
}

const DEFAULT_FORM_VALUES: IncomeForm = {
  amount: 0,
  details: "",
  accountId: "",
  paymentType: "",
  category: "",
  notes: "",
  date: new Date().toISOString(),
};

export default function IncomeModal({
  visible,
  transaction,
  onDismiss,
}: Props) {
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
  } = useTransactionStore();

  const {
    categories,
    loadCategories,
  } = useCategoryStore();

  // ========================================
  // STATE
  // ========================================

  const [
    categoryPickerVisible,
    setCategoryPickerVisible,
  ] = useState(false);

  // ========================================
  // FORM
  // ========================================

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IncomeForm>({
    resolver: zodResolver(
      incomeSchema
    ),

    defaultValues:
      DEFAULT_FORM_VALUES,
  });

  // ========================================
  // SELECTED CATEGORY
  // ========================================

  const selectedCategoryId =
    watch("category");

  const selectedCategory =
    categories.find(
      (category) =>
        category.id ===
        selectedCategoryId
    );

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

        date:
          transaction.date,
      });

      return;
    }

    // ======================================
    // ADD
    // ======================================

    reset({
      amount: 0,
      details: "",
      accountId: "",
      paymentType: "",
      category: "",
      notes: "",
      date: new Date().toISOString(),
    });
  }, [
    visible,
    transaction,
    reset,
    loadAccounts,
    loadCategories,
  ]);

  // ========================================
  // SUBMIT
  // ========================================

  const onSubmit = async (
    data: IncomeForm
  ) => {
    // ======================================
    // EDIT INCOME
    // ======================================

    if (transaction) {
      const result =
        await updateTransaction({
          ...transaction,

          type: "income",

          amount:
            data.amount,

          details:
            data.details,

          accountId:
            data.accountId,

          paymentType:
            data.paymentType as Transaction[
              "paymentType"
            ],

          category:
            data.category,

          notes:
            data.notes,

          date:
            data.date,

          updatedAt:
            new Date().toISOString(),
        });

      if (!result.success) {
        console.error(
          "Failed to update income:",
          result.error
        );

        return;
      }

      await loadAccounts();

      reset(
        DEFAULT_FORM_VALUES
      );

      setCategoryPickerVisible(
        false
      );

      onDismiss();

      return;
    }

    // ======================================
    // ADD INCOME
    // ======================================

    const result =
      await addTransaction({
        id:
          Date.now().toString(),

        type: "income",

        amount:
          data.amount,

        details:
          data.details,

        accountId:
          data.accountId,

        paymentType:
          data.paymentType as Transaction[
            "paymentType"
          ],

        category:
          data.category,

        notes:
          data.notes,

        date:
          data.date,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      });

    // ======================================
    // FAILED
    // ======================================

    if (!result.success) {
      console.error(
        "Failed to save income:",
        result.error
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

    setCategoryPickerVisible(
      false
    );

    onDismiss();
  };

  // ========================================
  // DISMISS
  // ========================================

  const handleDismiss = () => {
    setCategoryPickerVisible(
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
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={
            handleDismiss
          }
          contentContainerStyle={
            styles.modal
          }
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
            {/* TITLE */}

            <Text
              variant="headlineSmall"
              style={styles.title}
            >
              {transaction
                ? "Edit Income"
                : "Add Income"}
            </Text>

            {/* ================================= */}
            {/* AMOUNT */}
            {/* ================================= */}

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

            {/* ================================= */}
            {/* DETAILS */}
            {/* ================================= */}

            <Controller
              control={control}
              name="details"
              render={({
                field,
              }) => (
                <TextInput
                  mode="outlined"
                  label="Details"
                  placeholder="Salary"
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

            {/* ================================= */}
            {/* ACCOUNT */}
            {/* ================================= */}

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

                    {accounts.map(
                      (
                        account
                      ) => (
                        <Picker.Item
                          key={
                            account.id
                          }
                          label={`${account.name} - ₹${account.balance}`}
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

            {/* ================================= */}
            {/* PAYMENT TYPE */}
            {/* ================================= */}

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
                      label="Bank Transfer"
                      value="Bank Transfer"
                    />

                    <Picker.Item
                      label="UPI"
                      value="UPI"
                    />

                    <Picker.Item
                      label="Cash"
                      value="Cash"
                    />

                    <Picker.Item
                      label="Cheque"
                      value="Cheque"
                    />

                    <Picker.Item
                      label="Other"
                      value="Other"
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
                  errors.paymentType
                    .message
                }
              </Text>
            )}

            <View
              style={
                styles.spacing
              }
            />

            {/* ================================= */}
            {/* CATEGORY */}
            {/* ================================= */}

            <Controller
              control={control}
              name="category"
              render={({
                field,
              }) => (
                <>
                  <TouchableRipple
                    onPress={() =>
                      setCategoryPickerVisible(
                        true
                      )
                    }
                    style={
                      styles.selectField
                    }
                  >
                    <View>
                      <Text
                        variant="bodySmall"
                        style={
                          styles.label
                        }
                      >
                        Category
                      </Text>

                      <Text
                        variant="bodyLarge"
                        style={
                          field.value
                            ? styles.value
                            : styles.placeholder
                        }
                      >
                        {selectedCategory
                          ?.name ||
                          "Select category"}
                      </Text>
                    </View>
                  </TouchableRipple>

                  {errors.category
                    ?.message && (
                    <Text
                      style={
                        styles.error
                      }
                    >
                      {
                        errors
                          .category
                          .message
                      }
                    </Text>
                  )}
                </>
              )}
            />

            <View
              style={
                styles.spacing
              }
            />

            {/* ================================= */}
            {/* NOTES */}
            {/* ================================= */}

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

            <View
              style={
                styles.buttonSpacing
              }
            />

            {/* ================================= */}
            {/* SAVE */}
            {/* ================================= */}

            <Button
              mode="contained"
              buttonColor="#16A34A"
              onPress={handleSubmit(
                onSubmit
              )}
            >
              {transaction
                ? "Update Income"
                : "Save Income"}
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      {/* ================================== */}
      {/* CATEGORY PICKER */}
      {/* ================================== */}

      <CategoryPickerModal
        visible={
          categoryPickerVisible
        }
        value={
          selectedCategoryId
        }
        type="income"
        onSelect={(
          category
        ) => {
          setValue(
            "category",
            category?.id ?? "",
            {
              shouldValidate:
                true,
              shouldDirty:
                true,
            }
          );
        }}
        onDismiss={() =>
          setCategoryPickerVisible(
            false
          )
        }
      />
    </>
  );
}

// ========================================
// STYLES
// ========================================

const styles =
  StyleSheet.create({
    modal: {
      backgroundColor:
        "white",
      margin: 20,
      borderRadius: 20,
      maxHeight: "90%",
    },

    content: {
      padding: 20,
      paddingBottom: 30,
    },

    title: {
      marginBottom: 20,
      fontWeight: "600",
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

    selectField: {
      borderWidth: 1,
      borderColor:
        "#79747E",
      borderRadius: 4,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    label: {
      color: "#49454F",
      marginBottom: 4,
    },

    value: {
      color: "#1C1B1F",
    },

    placeholder: {
      color: "#777",
    },
  });
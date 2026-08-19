import { useEffect } from "react";

import {
  Controller,
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

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

import {
  Picker,
} from "@react-native-picker/picker";

import {
  useAccountStore,
} from "../../../store";

import {
  useNotificationStore,
} from "../../../store/notificationStore";

import {
  Account,
} from "../types/account";

import {
  accountSchema,
  AccountForm,
} from "../validation/accountSchema";

interface Props {
  visible: boolean;

  account?: Account | null;

  onDismiss: () => void;
}

const ACCOUNT_TYPES = [
  {
    label: "Savings Account",
    value: "Savings",
  },
  {
    label: "Current Account",
    value: "Current",
  },
  {
    label: "Credit Card",
    value: "Credit Card",
  },
  {
    label: "Cash",
    value: "Cash",
  },
  {
    label: "Wallet",
    value: "Wallet",
  },
  {
    label: "Investment",
    value: "Investment",
  },
  {
    label: "Loan",
    value: "Loan",
  },
  {
    label: "UPI",
    value: "UPI",
  },
  {
    label: "Other",
    value: "Other",
  },
] as const;

const DEFAULT_FORM_VALUES: AccountForm = {
  name: "",
  balance: 0,
  color: "#2563EB",
  type: "Savings",
  creditLimit: 0,
  outstanding: 0,
  billingCycleStartDay: 1,
  billingCycleEndDay: 30,
  dueDateDay: 5,
};

export default function AccountModal({
  visible,
  account,
  onDismiss,
}: Props) {
  const theme = useTheme();

  const {
    addAccount,
    updateAccount,
  } = useAccountStore();

  const {
    showNotification,
  } = useNotificationStore();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: {
      errors,
    },
  } = useForm<AccountForm>({
    resolver:
      zodResolver(
        accountSchema
      ),

    defaultValues:
      DEFAULT_FORM_VALUES,
  });

  const selectedType =
    watch("type");

  const isCreditCard =
    selectedType ===
    "Credit Card";

  // ========================================
  // LOAD FORM
  // ========================================

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (account) {
      reset({
        name:
          account.name,

        balance:
          account.balance,

        color:
          account.color,

        type:
          account.type,

        creditLimit:
          account.creditLimit ??
          0,

        outstanding:
          account.outstanding ??
          account.balance ??
          0,

        billingCycleStartDay:
          account.billingCycleStartDay ??
          1,

        billingCycleEndDay:
          account.billingCycleEndDay ??
          30,

        dueDateDay:
          account.dueDateDay ??
          5,
      });

      return;
    }

    reset(
      DEFAULT_FORM_VALUES
    );
  }, [
    visible,
    account,
    reset,
  ]);

  // ========================================
  // SUBMIT
  // ========================================

  const onSubmit = async (
    data: AccountForm
  ) => {
    try {
      const now =
        new Date().toISOString();

      // ====================================
      // CREDIT CARD
      // ====================================

      if (
        data.type ===
        "Credit Card"
      ) {
        if (
          data.creditLimit <=
          0
        ) {
          showNotification(
            "Credit limit must be greater than zero.",
            "error"
          );

          return;
        }

        if (
          data.outstanding >
          data.creditLimit
        ) {
          showNotification(
            "Outstanding amount cannot be greater than credit limit.",
            "error"
          );

          return;
        }

        data.balance =
          data.outstanding;
      }

      // ====================================
      // NORMAL ACCOUNT
      // ====================================

      if (
        data.type !==
        "Credit Card"
      ) {
        data.creditLimit = 0;
        data.outstanding = 0;
        data.billingCycleStartDay = 1;
        data.billingCycleEndDay = 30;
        data.dueDateDay = 5;
      }

      // ====================================
      // EDIT
      // ====================================

      if (account) {
        await updateAccount({
          ...account,

          ...data,

          updatedAt: now,
        });

        showNotification(
          "Account updated successfully.",
          "success"
        );
      }

      // ====================================
      // ADD
      // ====================================

      else {
        await addAccount({
          id:
            Date.now().toString(),

          ...data,

          createdAt: now,

          updatedAt: now,
        });

        showNotification(
          "Account added successfully.",
          "success"
        );
      }

      reset(
        DEFAULT_FORM_VALUES
      );

      onDismiss();
    } catch (error) {
      console.error(
        "Account save failed:",
        error
      );

      showNotification(
        "Unable to save account.",
        "error"
      );
    }
  };

  // ========================================
  // UI
  // ========================================

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
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
          {/* ================================= */}
          {/* TITLE */}
          {/* ================================= */}

          <Text
            variant="headlineSmall"
            style={styles.title}
          >
            {account
              ? "Edit Account"
              : "Add Account"}
          </Text>

          {/* ================================= */}
          {/* ACCOUNT NAME */}
          {/* ================================= */}

          <Controller
            control={control}
            name="name"
            render={({
              field,
            }) => (
              <TextInput
                mode="outlined"
                label="Account Name"
                placeholder="Example: HDFC Savings"
                value={
                  field.value
                }
                onChangeText={
                  field.onChange
                }
              />
            )}
          />

          {errors.name
            ?.message && (
            <Text
              style={
                styles.error
              }
            >
              {
                errors.name
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
          {/* ACCOUNT TYPE */}
          {/* ================================= */}

          <Controller
            control={control}
            name="type"
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
                  Account Type
                </Text>

                <Picker
                  selectedValue={
                    field.value
                  }
                  onValueChange={
                    field.onChange
                  }
                >
                  {ACCOUNT_TYPES.map(
                    (item) => (
                      <Picker.Item
                        key={
                          item.value
                        }
                        label={
                          item.label
                        }
                        value={
                          item.value
                        }
                      />
                    )
                  )}
                </Picker>
              </View>
            )}
          />

          {errors.type
            ?.message && (
            <Text
              style={
                styles.error
              }
            >
              {
                errors.type
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
          {/* CREDIT CARD FIELDS */}
          {/* ================================= */}

          {isCreditCard && (
            <>
              <Controller
                control={
                  control
                }
                name="creditLimit"
                render={({
                  field,
                }) => (
                  <TextInput
                    mode="outlined"
                    label="Credit Limit"
                    placeholder="50000"
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
                      text
                    ) =>
                      field.onChange(
                        Number(
                          text
                        ) || 0
                      )
                    }
                  />
                )}
              />

              {errors.creditLimit
                ?.message && (
                <Text
                  style={
                    styles.error
                  }
                >
                  {
                    errors
                      .creditLimit
                      .message
                  }
                </Text>
              )}

              <View
                style={
                  styles.spacing
                }
              />

              <View
                style={
                  styles.dayRow
                }
              >
                <View
                  style={
                    styles.dayItem
                  }
                >
                  <Controller
                    control={
                      control
                    }
                    name="billingCycleStartDay"
                    render={({
                      field,
                    }) => (
                      <TextInput
                        mode="outlined"
                        label="Cycle Start Day"
                        placeholder="1"
                        keyboardType="numeric"
                        value={String(
                          field.value
                        )}
                        onChangeText={(
                          text
                        ) =>
                          field.onChange(
                            Number(
                              text
                            ) || 1
                          )
                        }
                      />
                    )}
                  />
                </View>

                <View
                  style={
                    styles.dayItem
                  }
                >
                  <Controller
                    control={
                      control
                    }
                    name="billingCycleEndDay"
                    render={({
                      field,
                    }) => (
                      <TextInput
                        mode="outlined"
                        label="Cycle End Day"
                        placeholder="30"
                        keyboardType="numeric"
                        value={String(
                          field.value
                        )}
                        onChangeText={(
                          text
                        ) =>
                          field.onChange(
                            Number(
                              text
                            ) || 1
                          )
                        }
                      />
                    )}
                  />
                </View>
              </View>

              {(errors.billingCycleStartDay
                ?.message ||
                errors.billingCycleEndDay
                  ?.message) && (
                <Text
                  style={
                    styles.error
                  }
                >
                  {errors
                    .billingCycleStartDay
                    ?.message ??
                    errors
                      .billingCycleEndDay
                      ?.message}
                </Text>
              )}

              <View
                style={
                  styles.spacing
                }
              />

              <Controller
                control={
                  control
                }
                name="dueDateDay"
                render={({
                  field,
                }) => (
                  <TextInput
                    mode="outlined"
                    label="Due Date Day"
                    placeholder="5"
                    keyboardType="numeric"
                    value={String(
                      field.value
                    )}
                    onChangeText={(
                      text
                    ) =>
                      field.onChange(
                        Number(
                          text
                        ) || 1
                      )
                    }
                  />
                )}
              />

              {errors.dueDateDay
                ?.message && (
                <Text
                  style={
                    styles.error
                  }
                >
                  {
                    errors
                      .dueDateDay
                      .message
                  }
                </Text>
              )}

              <Controller
                control={
                  control
                }
                name="outstanding"
                render={({
                  field,
                }) => (
                  <TextInput
                    mode="outlined"
                    label="Outstanding Amount"
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
                      text
                    ) =>
                      field.onChange(
                        Number(
                          text
                        ) || 0
                      )
                    }
                  />
                )}
              />

              {errors.outstanding
                ?.message && (
                <Text
                  style={
                    styles.error
                  }
                >
                  {
                    errors
                      .outstanding
                      .message
                  }
                </Text>
              )}

              <View
                style={
                  styles.availableBox
                }
              >
                <Text
                  variant="bodySmall"
                  style={
                    styles.availableLabel
                  }
                >
                  Available Credit
                </Text>

                <Text
                  variant="titleLarge"
                  style={
                    styles.availableAmount
                  }
                >
                  ₹
                  {Math.max(
                    0,
                    (watch(
                      "creditLimit"
                    ) || 0) -
                      (watch(
                        "outstanding"
                      ) || 0)
                  ).toLocaleString(
                    "en-IN"
                  )}
                </Text>
              </View>
            </>
          )}

          {/* ================================= */}
          {/* NORMAL ACCOUNT BALANCE */}
          {/* ================================= */}

          {!isCreditCard && (
            <>
              <Controller
                control={
                  control
                }
                name="balance"
                render={({
                  field,
                }) => (
                  <TextInput
                    mode="outlined"
                    label="Opening Balance"
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
                      text
                    ) =>
                      field.onChange(
                        Number(
                          text
                        ) || 0
                      )
                    }
                  />
                )}
              />

              {errors.balance
                ?.message && (
                <Text
                  style={
                    styles.error
                  }
                >
                  {
                    errors.balance
                      .message
                  }
                </Text>
              )}
            </>
          )}

          {/* ================================= */}
          {/* BUTTON */}
          {/* ================================= */}

          <View
            style={
              styles.buttonSpacing
            }
          />

          <Button
            mode="contained"
            onPress={handleSubmit(
              onSubmit
            )}
          >
            {account
              ? "Update Account"
              : "Save Account"}
          </Button>
        </ScrollView>
      </Modal>
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

    availableBox: {
      marginTop: 16,

      padding: 16,

      borderRadius: 12,

      backgroundColor:
        "#EFF6FF",
    },

    availableLabel: {
      color: "#64748B",
    },

    availableAmount: {
      marginTop: 4,

      color: "#2563EB",

      fontWeight: "700",
    },

    dayRow: {
      flexDirection: "row",

      gap: 12,
    },

    dayItem: {
      flex: 1,
    },
  });

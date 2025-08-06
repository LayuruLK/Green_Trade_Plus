// PersonalInfoScreen.js - Second step of registration

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import FormInput from './FormInput';
import RadioGroup from './RadioGroup';

const PersonalInfoScreen = ({ 
  formData, 
  updateFormData, 
  goToNextStep, 
  goToPreviousStep,
  errors 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={goToPreviousStep}
          >
            <AntDesign name="arrowleft" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Personal Information</Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.nameRow}>
            <FormInput
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              error={errors.firstName}
              containerStyle={styles.nameInput}
              autoCapitalize="words"
            />
            
            <FormInput
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              error={errors.lastName}
              containerStyle={styles.nameInput}
              autoCapitalize="words"
            />
          </View>
          
          <FormInput
            label="Username"
            placeholder="Create a userName"
            value={formData.userName}
            onChangeText={(text) => handleInputChange('userName', text)}
            error={errors.userName}
            leftIcon={<MaterialIcons name="alternate-email" size={20} color={COLORS.textSecondary} />}
            autoCapitalize="none"
          />
          
          <FormInput
            label="Email (Optional)"
            placeholder="Enter your email address"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            error={errors.email}
            leftIcon={<MaterialIcons name="email" size={20} color={COLORS.textSecondary} />}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Text style={styles.label}>Gender</Text>
          <RadioGroup
            options={genderOptions}
            selected={formData.gender}
            onSelect={(value) => handleInputChange('gender', value)}
          />
          {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
          
          <FormInput
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            error={errors.password}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={COLORS.textSecondary} 
                />
              </TouchableOpacity>
            }
          />
          
          <FormInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
            error={errors.confirmPassword}
            secureTextEntry={!showConfirmPassword}
            rightIcon={
              <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={COLORS.textSecondary} 
                />
              </TouchableOpacity>
            }
          />
        </View>

        <View style={styles.spacer} />
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.nextButton} 
        onPress={goToNextStep}
      >
        <AntDesign name="arrowright" size={24} color="white" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 15,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 15,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  spacer: {
    height: 80,
  },
});

export default PersonalInfoScreen;
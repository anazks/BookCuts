import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { createOrder } from '../../api/Service/Booking';

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const PaymentOption = ({ title, amount, isSelected, onPress, note }) => (
  <TouchableOpacity
    style={[
      styles.paymentOption,
      isSelected && styles.selectedOption
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.optionContent}>
      <Text style={styles.optionText}>{title}</Text>
      <Text style={styles.optionAmount}>₹{amount}</Text>
      {note && <Text style={styles.optionNote}>{note}</Text>}
    </View>
    {isSelected && <View style={styles.selectedIndicator} />}
  </TouchableOpacity>
);

export default function PayNow() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [bookingData, setBookingData] = useState(null);
  const [paymentType, setPaymentType] = useState('full');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const { 
    bookingData: bookingDataString,
    barberName,
    bookingDate,
    timeSlot,
    totalPrice,
    advanceAmount,
    customerName = 'Customer',
    customerEmail = 'customer@example.com',
    customerPhone = '9999999999'
  } = params;

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        if (bookingDataString && !bookingData) {
          const parsedData = JSON.parse(bookingDataString);
          setBookingData(parsedData);
        }
      } catch (error) {
        console.error('Error parsing booking data:', error);
        Alert.alert('Error', 'Failed to load booking details');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingData();
  }, [bookingDataString]);

  const handlePaymentSuccess = useCallback((paymentId) => {
    router.push({
      pathname: '/booking/confirmation',
      params: {
        bookingId: bookingData?.id,
        paymentId,
        paymentType,
        amount: paymentType === 'advance' ? advanceAmount : totalPrice
      }
    });
  }, [bookingData, paymentType, advanceAmount, totalPrice]);

  const handlePayment = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const amount = paymentType === 'advance' 
        ? parseFloat(advanceAmount) 
        : parseFloat(totalPrice);

      // Fixed: Added missing closing parenthesis
      if (isNaN(amount)) {
        throw new Error('Invalid payment amount');
      }

      console.log('Creating order with data:', {
        amount,
        currency: 'INR',
        bookingId: bookingData?.id,
        paymentType,
        services: bookingData?.services,
        customerDetails: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        }
      });

      const orderResponse = await createOrder({
        amount,
        currency: 'INR',
        bookingId: bookingData?.id,
        paymentType,
        services: bookingData?.services,
        customerDetails: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        }
      });

      console.log('Order response:', orderResponse);

      if (!orderResponse?.id) {
        throw new Error(orderResponse?.message || 'Failed to create payment order');
      }

      const options = {
        name: 'Barber Shop',
        description: 'Booking Payment',
        order_id: orderResponse.id,
        key: 'rzp_test_fccR1aGiSJLS1e', // Replace with your actual Razorpay key
        amount: Math.round(amount * 100), // Convert to paise and ensure integer
        currency: 'INR',
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        theme: { color: '#4CAF50' }
      };

      RazorpayCheckout.open(options)
        .then(({ razorpay_payment_id }) => {
          handlePaymentSuccess(razorpay_payment_id);
        })
        .catch((error) => {
          console.error('Razorpay error:', error);
          if (error.code !== 2) { // Ignore manual dismissals
            Alert.alert('Payment Failed', error.description || 'Payment could not be completed');
          }
        });

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !bookingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  const remainingAmount = (parseFloat(totalPrice) - parseFloat(advanceAmount)).toFixed(2);
  const buttonText = paymentType === 'advance' 
    ? `Pay ₹${advanceAmount} Now` 
    : `Pay ₹${totalPrice} Now`;

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerContainer}>
        <Text style={styles.subHeader}>Review your booking and make payment</Text>
      </View>
      
      <View style={styles.bookingSummary}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <DetailRow label="Barber" value={barberName} />
          <DetailRow label="Date" value={bookingDate} />
          <DetailRow label="Time Slot" value={timeSlot} />
          <DetailRow 
            label="Services" 
            value={bookingData.services.map(s => s.name).join(', ')} 
          />
          <DetailRow label="Duration" value={`${bookingData.totalDuration} minutes`} />
          <View style={styles.totalAmountRow}>
            <Text style={styles.totalAmountLabel}>Total Amount</Text>
            <Text style={styles.totalAmountValue}>₹{totalPrice}</Text>
          </View>
        </View>
      </View>

      <View style={styles.paymentOptions}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment Options</Text>
        </View>
        
        <PaymentOption 
          title="Pay Full Amount"
          amount={totalPrice}
          isSelected={paymentType === 'full'}
          onPress={() => setPaymentType('full')}
        />
        
        <PaymentOption 
          title="Pay Advance Booking Fee"
          amount={advanceAmount}
          isSelected={paymentType === 'advance'}
          onPress={() => setPaymentType('advance')}
          note={`Remaining ₹${remainingAmount} to be paid at salon`}
        />
      </View>

      <TouchableOpacity 
        style={[styles.payButton, isProcessing && styles.disabledButton]}
        onPress={handlePayment}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>{buttonText}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  bookingSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentOptions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 8,
  },
  totalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalAmountLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  totalAmountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  optionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  optionNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  selectedIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 40,
    borderTopWidth: 40,
    borderRightColor: 'transparent',
    borderTopColor: '#4CAF50',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
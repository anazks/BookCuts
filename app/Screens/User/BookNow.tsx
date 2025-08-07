import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SlotBooking } from '../../api/Service/Booking';
import { getmyBarbers, getShopById, getShopServices } from '../../api/Service/Shop';
import RazorpayCheckout from 'react-native-razorpay';

const parseTime = (timeStr: string): string => {
  timeStr = timeStr.trim().toLowerCase();
  const match = timeStr.match(/(\d+)([ap]m)/);

  if (!match) return '09:00';

  let hour = parseInt(match[1], 10);
  const modifier = match[2];

  if (modifier === 'pm' && hour !== 12) {
    hour += 12;
  } else if (modifier === 'am' && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, '0')}:00`;
};

export default function BookNow() {
  const { shop_id } = useLocalSearchParams();
  const [shopDetails, setShopDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [paymentType, setPaymentType] = useState('advance');
  const [servicesCollapsed, setServicesCollapsed] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        setError(null);

        const shopResponse = await getShopById(shop_id);
        console.log("Shop API Response:", shopResponse);

        if (!shopResponse?.success || !shopResponse.data?.length) {
          throw new Error(shopResponse?.message || "Failed to load shop details");
        }

        const shopData = shopResponse.data[0];
        const times = shopData.Timing?.split('-')?.map(t => t.trim()) || [];
        const openingTime = times.length > 0 ? parseTime(times[0]) : '09:00';
        const closingTime = times.length > 1 ? parseTime(times[1]) : '21:00';

        const [servicesResponse, barbersResponse] = await Promise.all([
          getShopServices(shop_id),
          getmyBarbers(shop_id)
        ]);

        const services = servicesResponse?.success && servicesResponse.data
          ? servicesResponse.data.map(service => ({
            id: service._id,
            name: service.ServiceName,
            price: parseInt(service.Rate, 10) || 0,
            duration: 30
          }))
          : [];

        const barbers = barbersResponse?.success && barbersResponse.data
          ? barbersResponse.data.map(barber => ({
            id: barber._id,
            name: barber.BarBarName,
            nativePlace: barber.From
          }))
          : [];

        setShopDetails({
          id: shopData._id,
          name: shopData.ShopName,
          address: `${shopData.City || ''} • ${shopData.Mobile || ''}`,
          openingTime,
          closingTime,
          services,
          barbers,
          Timing: shopData.Timing
        });

      } catch (error) {
        console.error("Error fetching shop data:", error);
        setError(error.message || "Failed to load shop details");
      } finally {
        setLoading(false);
      }
    };

    if (shop_id) {
      fetchShopData();
    } else {
      setError('No shop ID provided');
      setLoading(false);
    }
  }, [shop_id]);

  const getTimeSlots = () => {
    if (!shopDetails) return [];

    return [
      { id: 1, name: "Morning", start: shopDetails.openingTime, end: "12:00" },
      { id: 2, name: "Noon", start: "12:00", end: "15:00" },
      { id: 3, name: "Evening", start: "15:00", end: "19:00" },
      { id: 4, name: "Night", start: "19:00", end: shopDetails.closingTime },
    ];
  };

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
  const advanceAmount = Math.min(20, totalPrice);

  const prepareFormData = () => {
    return {
      shopId: shopDetails.id,
      shopName: shopDetails.name,
      barberId: selectedBarber?.id,
      barberName: selectedBarber?.name,
      barberNativePlace: selectedBarber?.nativePlace,
      serviceIds: selectedServices.map(s => s.id),
      services: selectedServices.map(service => ({
        id: service.id,
        name: service.name,
        price: service.price,
        duration: service.duration
      })),
      bookingDate: selectedDate?.toISOString().split('T')[0],
      timeSlotId: selectedTimeSlot?.id,
      timeSlotName: selectedTimeSlot?.name,
      timeSlotStart: selectedTimeSlot?.start,
      timeSlotEnd: selectedTimeSlot?.end,
      totalPrice,
      totalDuration,
      paymentType,
      amountToPay: paymentType === 'advance' ? advanceAmount : totalPrice,
      remainingAmount: paymentType === 'advance' ? totalPrice - advanceAmount : 0,
      bookingTimestamp: new Date().toISOString(),
      currency: 'INR'
    };
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const toggleService = (service) => {
    if (selectedServices.some(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const validateBooking = () => {
    if (!selectedBarber) return "Please select a barber";
    if (selectedServices.length === 0) return "Please select at least one service";
    if (!selectedDate) return "Please select a date";
    if (!selectedTimeSlot) return "Please select a time slot";
    return null;
  };
  //old code
  // const handleBookNow = async () => {
  //   const validationError = validateBooking();
  //   if (validationError) {
  //     Alert.alert("Incomplete Booking", validationError);
  //     return;
  //   }

  //   setIsBooking(true);

  //   try {
  //     const formData = prepareFormData();
  //     console.log("Booking Form Data:", JSON.stringify(formData, null, 2));
  //     let response = await SlotBooking(formData);
  //     // await new Promise(resolve => setTimeout(resolve, 2000));

  //     Alert.alert(
  //       "Booking Confirmed", 
  //       `Your appointment at ${shopDetails.name} is booked for ${selectedDate.toDateString()} during ${selectedTimeSlot.name}.\n\nAmount to pay: ₹${formData.amountToPay}`,
  //       [{ text: "OK", style: "default" }]
  //     );

  //   } catch (error) {
  //     Alert.alert("Booking Failed", "Something went wrong. Please try again.");
  //     console.error("Booking error:", error);
  //   } finally {
  //     setIsBooking(false);
  //   }
  // };

  //new code
  const handleBookNow = async () => {
    const validationError = validateBooking();
    if (validationError) {
      Alert.alert("Incomplete Booking", validationError);
      return;
    }

    const formData = prepareFormData();

    const amountInPaise = formData.amountToPay * 100;

    const options = {
      description: 'Booking at ' + formData.shopName,
      // image: 'https://your-logo-url.png', // optional
      currency: 'INR',
      key: 'YOUR_RAZORPAY_KEY_ID', // replace with your Razorpay Key ID
      amount: amountInPaise.toString(),
      name: 'Book My Cuts',
      prefill: {
        email: 'test@example.com', // optional, get from user profile if available
        contact: '9876543210',     // optional, get from user
        name: 'Customer Name'      // optional, get from user
      },
      theme: { color: '#0ea5e9' }
    };

    RazorpayCheckout.open(options)
      .then(async (paymentData) => {
        // paymentData.razorpay_payment_id

        try {
          setIsBooking(true);

          const finalFormData = {
            ...formData,
            razorpayPaymentId: paymentData.razorpay_payment_id,
          };

          const response = await SlotBooking(finalFormData);

          Alert.alert(
            "Booking Confirmed",
            `Your appointment at ${shopDetails.name} is booked for ${selectedDate.toDateString()} during ${selectedTimeSlot.name}.\n\nAmount Paid: ₹${formData.amountToPay}`,
            [{ text: "OK", style: "default" }]
          );

        } catch (error) {
          Alert.alert("Booking Failed", "Something went wrong after payment.");
          console.error("Booking error after payment:", error);
        } finally {
          setIsBooking(false);
        }
      })
      .catch((error) => {
        console.error("Payment failed:", error);
        Alert.alert("Payment Failed", "Your payment was cancelled or failed.");
      });
  };

  const getProgressSteps = () => {
    let completed = 0;
    if (selectedBarber) completed++;
    if (selectedServices.length > 0) completed++;
    if (selectedDate && selectedTimeSlot) completed++;
    return { completed, total: 3 };
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#555" />
        <Text style={styles.loadingText}>Loading shop details...</Text>
      </View>
    );
  }

  if (error || !shopDetails) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error || "Failed to load shop details"}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            if (shop_id) {
              const fetchShopData = async () => {
                try {
                  // ... (same fetch logic as in useEffect)
                } catch (error) {
                  setError(error.message);
                } finally {
                  setLoading(false);
                }
              };
              fetchShopData();
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = getProgressSteps();
  const timeSlots = getTimeSlots();

  return (
    <View style={styles.container}>
      <View style={styles.shopHeader}>
        <Text style={styles.shopName}>{shopDetails.name}</Text>
        <Text style={styles.shopAddress}>{shopDetails.address}</Text>
        <Text style={styles.shopHours}>
          Open: {shopDetails.Timing || `${shopDetails.openingTime} - ${shopDetails.closingTime}`}
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(progress.completed / progress.total) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress.completed}/{progress.total} steps completed</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Barber Selection */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Select Barber</Text>
            {selectedBarber && <Text style={styles.checkmark}>✓</Text>}
          </View>
          {shopDetails.barbers.length > 0 ? (
            <View style={styles.barberContainer}>
              {shopDetails.barbers.map(barber => (
                <TouchableOpacity
                  key={barber.id}
                  style={[
                    styles.barberItem,
                    selectedBarber?.id === barber.id && styles.selectedBarber
                  ]}
                  onPress={() => setSelectedBarber(barber)}
                  activeOpacity={0.7}>
                  <Text style={styles.barberName}>{barber.name}</Text>
                  <Text style={styles.barberPlace}>{barber.nativePlace}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noItemsText}>No barbers available at this shop</Text>
          )}
        </View>

        {/* Services Selection */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardTitleContainer}
            onPress={() => setServicesCollapsed(!servicesCollapsed)}>
            <Text style={styles.cardTitle}>Select Services</Text>
            <View style={styles.servicesSummary}>
              {selectedServices.length > 0 && (
                <Text style={styles.servicesCount}>{selectedServices.length} selected</Text>
              )}
              <Text style={styles.collapseIcon}>
                {servicesCollapsed ? '▼' : '▲'}
              </Text>
            </View>
          </TouchableOpacity>

          <Collapsible collapsed={servicesCollapsed}>
            {shopDetails.services.length > 0 ? (
              <View style={styles.servicesGrid}>
                {shopDetails.services.map(service => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceItem,
                      selectedServices.some(s => s.id === service.id) && styles.selectedService
                    ]}
                    onPress={() => toggleService(service)}
                    activeOpacity={0.7}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      {selectedServices.some(s => s.id === service.id) && (
                        <Text style={styles.serviceCheckmark}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.servicePrice}>₹{service.price}</Text>
                    <Text style={styles.serviceDuration}>{service.duration} min</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noItemsText}>No services available at this shop</Text>
            )}
          </Collapsible>

          {selectedServices.length > 0 && (
            <View style={styles.servicesSummaryCard}>
              <Text style={styles.summaryTitle}>Selected Services Summary</Text>
              <Text style={styles.summaryText}>
                {selectedServices.length} services • {totalDuration} min total
              </Text>
            </View>
          )}
        </View>

        {/* Date & Time Selection */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Select Date & Time</Text>
            {selectedDate && selectedTimeSlot && <Text style={styles.checkmark}>✓</Text>}
          </View>

          <TouchableOpacity
            style={[styles.dateButton, selectedDate && styles.dateButtonSelected]}
            onPress={showDatePicker}
            activeOpacity={0.7}>
            <Text style={selectedDate ? styles.dateText : styles.datePlaceholder}>
              {selectedDate ? selectedDate.toDateString() : "Choose a date"}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            minimumDate={new Date()}
          />

          {selectedDate && (
            <>
              <Text style={styles.timeSlotTitle}>Available Time Slots:</Text>
              <View style={styles.timeSlotContainer}>
                {timeSlots.map(slot => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.timeSlot,
                      selectedTimeSlot?.id === slot.id && styles.selectedTimeSlot
                    ]}
                    onPress={() => setSelectedTimeSlot(slot)}
                    activeOpacity={0.7}>
                    <Text style={styles.timeSlotName}>{slot.name}</Text>
                    <Text style={styles.timeSlotHours}>{slot.start} - {slot.end}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Payment Options */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Options</Text>

          {totalPrice > 0 && (
            <View style={styles.pricingSummary}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Total Services:</Text>
                <Text style={styles.paymentValue}>₹{totalPrice}</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Duration:</Text>
                <Text style={styles.paymentValue}>{totalDuration} min</Text>
              </View>
            </View>
          )}

          <View style={styles.paymentOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentType === 'advance' && styles.selectedPaymentOption
              ]}
              onPress={() => setPaymentType('advance')}
              activeOpacity={0.7}>
              <View style={styles.paymentOptionHeader}>
                <Text style={[
                  styles.paymentOptionText,
                  paymentType === 'advance' && styles.selectedPaymentOptionText
                ]}>
                  Pay Advance ₹{advanceAmount}
                </Text>
                {paymentType === 'advance' && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.paymentOptionSubtext}>
                Remaining ₹{totalPrice - advanceAmount} at shop
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentType === 'full' && styles.selectedPaymentOption
              ]}
              onPress={() => setPaymentType('full')}
              activeOpacity={0.7}>
              <View style={styles.paymentOptionHeader}>
                <Text style={[
                  styles.paymentOptionText,
                  paymentType === 'full' && styles.selectedPaymentOptionText
                ]}>
                  Pay Full Amount ₹{totalPrice}
                </Text>
                {paymentType === 'full' && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.paymentOptionSubtext}>
                Complete payment now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Book Now Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            isBooking && styles.bookButtonLoading,
            (!selectedBarber || selectedServices.length === 0 || !selectedDate || !selectedTimeSlot) && styles.bookButtonDisabled
          ]}
          onPress={handleBookNow}
          disabled={isBooking || !selectedBarber || selectedServices.length === 0 || !selectedDate || !selectedTimeSlot}
          activeOpacity={0.8}>
          <Text style={styles.bookButtonText}>
            {isBooking ? 'Processing...' :
              paymentType === 'advance' ? `Pay ₹${advanceAmount} & Book` : `Pay ₹${totalPrice} & Book`}
          </Text>
          {totalPrice > 0 && !isBooking && (
            <Text style={styles.bookButtonSubtext}>
              {paymentType === 'advance' ?
                `Total: ₹${totalPrice} (₹${totalPrice - advanceAmount} remaining)` :
                `Total: ₹${totalPrice} • ${totalDuration} min`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  shopHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  shopAddress: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  shopHours: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#333',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  checkmark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  barberContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  barberItem: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  selectedBarber: {
    borderColor: '#333',
    backgroundColor: '#f5f5f5',
  },
  barberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  barberPlace: {
    fontSize: 14,
    color: '#666',
  },
  noItemsText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 16,
  },
  servicesSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  servicesCount: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  collapseIcon: {
    fontSize: 16,
    color: '#333',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  selectedService: {
    borderColor: '#333',
    backgroundColor: '#f5f5f5',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  serviceCheckmark: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
  },
  servicesSummaryCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  dateButtonSelected: {
    borderColor: '#333',
    backgroundColor: '#f5f5f5',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  timeSlotTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  selectedTimeSlot: {
    borderColor: '#333',
    backgroundColor: '#f5f5f5',
  },
  timeSlotName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  timeSlotHours: {
    fontSize: 14,
    color: '#666',
  },
  pricingSummary: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentOptionsContainer: {
    gap: 12,
  },
  paymentOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  selectedPaymentOption: {
    borderColor: '#333',
    backgroundColor: '#f5f5f5',
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  selectedPaymentOptionText: {
    fontWeight: '600',
  },
  paymentOptionSubtext: {
    fontSize: 14,
    color: '#666',
    marginLeft: 0,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bookButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  bookButtonLoading: {
    backgroundColor: '#666',
  },
  bookButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bookButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});
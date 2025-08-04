import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getShopById } from '../../api/Service/Shop';

// Helper function to convert time string to 24-hour format
const parseTime = (timeStr: string): string => {
  timeStr = timeStr.trim().toLowerCase();
  const match = timeStr.match(/(\d+)([ap]m)/);
  
  if (!match) return '09:00'; // Default fallback
  
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

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        setLoading(true);
        const response = await getShopById(shop_id);
        console.log("API Response:", response);
        
        if (response && response.success && response.data && response.data.length > 0) {
          const shopData = response.data[0];
          
          // Parse opening and closing times
          const times = shopData.Timing.split('-').map(t => t.trim());
          const openingTime = parseTime(times[0]);
          const closingTime = parseTime(times[1]);
          
          // Mock services and barbers (since API doesn't provide them)
          const mockServices = [
            { id: 1, name: "Haircut", price: 200, duration: 30 },
            { id: 2, name: "Beard Trim", price: 100, duration: 15 },
            { id: 3, name: "Hair Color", price: 500, duration: 60 },
            { id: 4, name: "Face Wash", price: 150, duration: 20 },
            { id: 5, name: "Head Massage", price: 250, duration: 30 },
          ];
          
          const mockBarbers = [
            { id: 1, name: "John Doe", nativePlace: "Mumbai", avatar: "👨" },
            { id: 2, name: "Mike Smith", nativePlace: "Delhi", avatar: "🧔" },
            { id: 3, name: "David Wilson", nativePlace: "Bangalore", avatar: "👨‍🦱" },
          ];
          
          setShopDetails({
            id: shopData._id,
            name: shopData.ShopName,
            address: `${shopData.City} • ${shopData.Mobile}`,
            openingTime,
            closingTime,
            services: mockServices,
            barbers: mockBarbers
          });
        } else {
          Alert.alert("Error", response?.message || "Failed to load shop details");
        }
      } catch (error) {
        console.error("Error fetching shop details:", error);
        Alert.alert("Error", "Failed to load shop details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (shop_id) {
      fetchShopDetails();
    } else {
      Alert.alert('Error', 'No shop ID provided');
      setLoading(false);
    }
  }, [shop_id]);

  // Time slots (will be generated based on shop details)
  const getTimeSlots = () => {
    if (!shopDetails) return [];
    
    return [
      { id: 1, name: "Morning", start: shopDetails.openingTime, end: "12:00", icon: "🌅" },
      { id: 2, name: "Noon", start: "12:00", end: "15:00", icon: "☀️" },
      { id: 3, name: "Evening", start: "15:00", end: "19:00", icon: "🌇" },
      { id: 4, name: "Night", start: "19:00", end: shopDetails.closingTime, icon: "🌙" },
    ];
  };

  // Calculate totals
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
  const advanceAmount = 20;

  // Prepare form data for backend
  const prepareFormData = () => {
    return {
      // Shop Information
      shopId: shopDetails.id,
      shopName: shopDetails.name,
      
      // Booking Details
      barberId: selectedBarber?.id,
      barberName: selectedBarber?.name,
      barberNativePlace: selectedBarber?.nativePlace,
      
      // Services
      serviceIds: selectedServices.map(s => s.id),
      services: selectedServices.map(service => ({
        id: service.id,
        name: service.name,
        price: service.price,
        duration: service.duration
      })),
      
      // Date & Time
      bookingDate: selectedDate?.toISOString().split('T')[0], // YYYY-MM-DD format
      timeSlotId: selectedTimeSlot?.id,
      timeSlotName: selectedTimeSlot?.name,
      timeSlotStart: selectedTimeSlot?.start,
      timeSlotEnd: selectedTimeSlot?.end,
      
      // Pricing
      totalPrice,
      totalDuration,
      paymentType, // 'advance' or 'full'
      amountToPay: paymentType === 'advance' ? advanceAmount : totalPrice,
      remainingAmount: paymentType === 'advance' ? totalPrice - advanceAmount : 0,
      
      // Metadata
      bookingTimestamp: new Date().toISOString(),
      currency: 'INR'
    };
  };

  // Date picker handlers
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  // Service selection with animation feedback
  const toggleService = (service) => {
    if (selectedServices.some(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Validation function
  const validateBooking = () => {
    if (!selectedBarber) return "Please select a barber";
    if (selectedServices.length === 0) return "Please select at least one service";
    if (!selectedDate) return "Please select a date";
    if (!selectedTimeSlot) return "Please select a time slot";
    return null;
  };

  // Booking submission with form data
  const handleBookNow = async () => {
    const validationError = validateBooking();
    if (validationError) {
      Alert.alert("Incomplete Booking", validationError);
      return;
    }

    setIsBooking(true);
    
    try {
      const formData = prepareFormData();
      
      // Log the structured data
      console.log("📋 Booking Form Data:", JSON.stringify(formData, null, 2));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        "🎉 Booking Confirmed!", 
        `Your appointment at ${shopDetails.name} is booked for ${selectedDate.toDateString()} during ${selectedTimeSlot.name}.\n\nAmount to pay: ₹${formData.amountToPay}`,
        [{ text: "Great!", style: "default" }]
      );
      
    } catch (error) {
      Alert.alert("Booking Failed", "Something went wrong. Please try again.");
      console.error("❌ Booking error:", error);
    } finally {
      setIsBooking(false);
    }
  };

  // Progress indicator
  const getProgressSteps = () => {
    let completed = 0;
    if (selectedBarber) completed++;
    if (selectedServices.length > 0) completed++;
    if (selectedDate && selectedTimeSlot) completed++;
    return { completed, total: 3 };
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading shop details...</Text>
      </View>
    );
  }

  // Error state
  if (!shopDetails) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Failed to load shop details</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => fetchShopDetails(shop_id)}
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
      {/* Shop Header with Progress */}
      <View style={styles.shopHeader}>
        <Text style={styles.shopName}>{shopDetails.name}</Text>
        <Text style={styles.shopAddress}>{shopDetails.address}</Text>
        <Text style={styles.shopHours}>
          Open: {shopDetails.Timing || `${shopDetails.openingTime} - ${shopDetails.closingTime}`}
        </Text>
        
        {/* Progress Bar */}
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
            <Text style={styles.cardTitle}>👨‍💼 Select Barber</Text>
            {selectedBarber && <Text style={styles.checkmark}>✓</Text>}
          </View>
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
                <Text style={styles.barberAvatar}>{barber.avatar}</Text>
                <Text style={styles.barberName}>{barber.name}</Text>
                <Text style={styles.barberPlace}>📍 {barber.nativePlace}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Services Selection */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.cardTitleContainer}
            onPress={() => setServicesCollapsed(!servicesCollapsed)}>
            <Text style={styles.cardTitle}>✂️ Select Services</Text>
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
                  <Text style={styles.serviceDuration}>⏱️ {service.duration} min</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Collapsible>

          {selectedServices.length > 0 && (
            <View style={styles.servicesSummaryCard}>
              <Text style={styles.summaryTitle}>Selected Services Summary</Text>
              <Text style={styles.summaryText}>
                {selectedServices.length} services • ⏱️ {totalDuration} min total
              </Text>
            </View>
          )}
        </View>

        {/* Date & Time Selection */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>📅 Select Date & Time</Text>
            {selectedDate && selectedTimeSlot && <Text style={styles.checkmark}>✓</Text>}
          </View>
          
          <TouchableOpacity 
            style={[styles.dateButton, selectedDate && styles.dateButtonSelected]}
            onPress={showDatePicker}
            activeOpacity={0.7}>
            <Text style={selectedDate ? styles.dateText : styles.datePlaceholder}>
              {selectedDate ? `📅 ${selectedDate.toDateString()}` : "📅 Choose a date"}
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
                    <Text style={styles.timeSlotIcon}>{slot.icon}</Text>
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
          <Text style={styles.cardTitle}>💳 Payment Options</Text>
          
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
                <Text style={styles.paymentOptionIcon}>💰</Text>
                <Text style={[
                  styles.paymentOptionText,
                  paymentType === 'advance' && styles.selectedPaymentOptionText
                ]}>
                  Pay Advance ₹20
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
                <Text style={styles.paymentOptionIcon}>💳</Text>
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
            {isBooking ? '⏳ Processing...' : 
             paymentType === 'advance' ? `💰 Pay ₹${advanceAmount} & Book` : `💳 Pay ₹${totalPrice} & Book`}
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
    backgroundColor: '#f8f9fa',
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
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  shopHeader: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    paddingTop: 30,
  },
  shopName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  shopAddress: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  shopHours: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  checkmark: {
    fontSize: 20,
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
    padding: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  selectedBarber: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
    transform: [{ scale: 1.02 }],
  },
  barberAvatar: {
    fontSize: 32,
    marginBottom: 8,
  },
  barberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  barberPlace: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
    color: '#FF6B6B',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '48%',
    padding: 14,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  selectedService: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
    transform: [{ scale: 1.02 }],
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  serviceCheckmark: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#666',
  },
  servicesSummaryCard: {
    backgroundColor: '#f8f9fa',
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
    fontSize: 13,
    color: '#666',
  },
  dateButton: {
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  dateButtonSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
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
    padding: 14,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  selectedTimeSlot: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
    transform: [{ scale: 1.02 }],
  },
  timeSlotIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  timeSlotName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timeSlotHours: {
    fontSize: 12,
    color: '#666',
  },
  pricingSummary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
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
    color: '#FF6B6B',
  },
  paymentOptionsContainer: {
    gap: 12,
  },
  paymentOption: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  selectedPaymentOption: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentOptionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  selectedPaymentOptionText: {
    color: '#FF6B6B',
  },
  paymentOptionSubtext: {
    fontSize: 13,
    color: '#666',
    marginLeft: 26,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bookButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  bookButtonLoading: {
    backgroundColor: '#FFB6B6',
  },
  bookButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});
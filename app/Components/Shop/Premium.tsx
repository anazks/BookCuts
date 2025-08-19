import React from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const PremiumServiceCard = ({ 
  service, 
  onPress,
  imageSource,
  showBadge = false,
  badgeText = "POPULAR"
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Badge */}
      {showBadge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}
      
      {/* Service Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={imageSource || { uri: 'https://via.placeholder.com/200x120/f0f0f0/999999?text=Service' }}
          style={styles.serviceImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
      </View>

      {/* Service Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {service?.name || 'Premium Service'}
          </Text>
          <View style={styles.priceContainer}>
            {service?.originalPrice && (
              <Text style={styles.originalPrice}>₹{service.originalPrice}</Text>
            )}
            <Text style={styles.price}>₹{service?.price || '1,500'}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {service?.description || 'Professional salon service with premium quality and expert care'}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaText}>⏱ {service?.duration || '45 min'}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={styles.metaText}>⭐ {service?.rating || '4.8'}</Text>
          </View>
        </View>

        {/* Book Button */}
        <TouchableOpacity style={styles.bookButton} onPress={onPress}>
          <Text style={styles.bookButtonText}>BOOK NOW</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

// Example usage component
export default function Premium() {
  const sampleServices = [
    {
      id: 1,
      name: "Luxury Hair Cut & Style",
      description: "Premium haircut with professional styling and finishing touches for a complete makeover",
      price: "1,500",
      originalPrice: "1,800",
      duration: "60 min",
      rating: "4.9",
      reviewCount: "245"
    },
    {
      id: 2,
      name: "Deluxe Facial Treatment",
      description: "Deep cleansing facial with premium products and relaxation therapy",
      price: "2,200",
      duration: "90 min",
      rating: "4.8",
      reviewCount: "189"
    },
    {
      id: 3,
      name: "Full Body Massage",
      description: "Therapeutic full body massage for ultimate relaxation and stress relief",
      price: "1,750",
      originalPrice: "2,000",
      duration: "75 min",
      rating: "4.7",
      reviewCount: "156"
    },
    {
      id: 4,
      name: "Manicure & Pedicure",
      description: "Complete nail care with premium polish and hand/foot treatment",
      price: "1,200",
      duration: "45 min",
      rating: "4.6",
      reviewCount: "98"
    },
    {
      id: 5,
      name: "Hair Color & Highlights",
      description: "Professional hair coloring with premium products and expert application",
      price: "2,800",
      originalPrice: "3,200",
      duration: "120 min",
      rating: "4.9",
      reviewCount: "203"
    }
  ]

  const handleServicePress = (service) => {
    console.log('Service pressed:', service.name)
    // Navigate to booking screen or show details
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Premium Services</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={280} // Card width + margin
        snapToAlignment="start"
      >
        {sampleServices.map((service, index) => (
          <PremiumServiceCard
            key={service.id}
            service={service}
            onPress={() => handleServicePress(service)}
            showBadge={index === 0} // Show badge on first item
            badgeText="MOST POPULAR"
          />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding:2,
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  viewAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  card: {
    width: 260,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ff6b35',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 1,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  detailsContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})
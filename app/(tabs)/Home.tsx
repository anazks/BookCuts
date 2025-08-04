import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getAllShops } from '../api/Service/Shop';
import { getmyProfile } from '../api/Service/User';

const Home = ({ navigation }) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // API call to fetch all shops
  const getShops = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllShops();
      if (result && result.success) {
        setShops(result.data);
      } else {
        console.log("Error fetching shops:", result);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      Alert.alert(
        "Error", 
        "Failed to load shops. Please check your connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile
  const getProfile = async () => {
    try {
      const response = await getmyProfile();
      console.log("User Profile Response:", response);
      if (response && response.success) {
        setUserProfile(response.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    getShops();
    getProfile();
  }, []);

  // Transform API data to match UI requirements
  const transformShopData = (apiShops) => {
    return apiShops.map((shop, index) => ({
      id: shop._id || shop.shopId || index.toString(),
      name: shop.ShopName || `${shop.firstName} ${shop.lastName}`.trim() || 'Unknown Shop',
      rating: '4.5',
      services: 'Haircut, Beard, Styling',
      price: '$25-45',
      distance: `${(Math.random() * 2 + 0.5).toFixed(1)} km`,
      city: shop.City || shop.city || 'Unknown City',
      timing: shop.Timing || '9am - 8pm',
      mobile: shop.Mobile || shop.mobileNo || '',
      website: shop.website || '',
      email: shop.email || '',
      image: `https://images.unsplash.com/photo-${1595476108010 + (index * 1000)}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60`
    }));
  };

  // Get popular shops (first 6 shops)
  const getPopularShops = () => {
    const transformedShops = transformShopData(shops);
    return transformedShops.slice(0, 6);
  };

  // Get top rated shops
  const getTopRatedShops = () => {
    const transformedShops = transformShopData(shops);
    const topRated = transformedShops.filter(shop => 
      ['Kochi', 'Salem', 'Kerala'].includes(shop.city)
    ).slice(0, 4);
    
    if (topRated.length < 4) {
      const remaining = transformedShops.filter(shop => 
        !['Kochi', 'Salem', 'Kerala'].includes(shop.city)
      ).slice(0, 4 - topRated.length);
      return [...topRated, ...remaining];
    }
    
    return topRated;
  };

  // Sample trending designs data
  const trendingDesigns = [
    { 
      id: '1', 
      name: 'Fade Cut', 
      popularity: '92%',
      image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' 
    },
    { 
      id: '2', 
      name: 'Pompadour', 
      popularity: '87%',
      image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' 
    },
    { 
      id: '3', 
      name: 'Undercut', 
      popularity: '89%',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' 
    },
  ];

  const quickServices = [
    { id: '1', name: 'Haircut', icon: 'cut', color: '#4A90E2' },
    { id: '2', name: 'Beard Trim', icon: 'leaf', color: '#50C878' },
    { id: '3', name: 'Hair Wash', icon: 'water', color: '#FF6B6B' },
    { id: '4', name: 'Styling', icon: 'brush', color: '#9B59B6' },
  ];

  // Handle shop card press
  const handleShopPress = (shop) => {
    console.log('Shop pressed:', shop);
  };

  // Handle refresh
  const handleRefresh = () => {
    getShops();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading shops...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Navigation Header */}
      <View style={styles.navContainer}>
        <View style={styles.navContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.locationText}>{userProfile ? userProfile.city : 'india'}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Ionicons name="refresh-outline" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#333" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation?.navigate('Profile')}
            >
              <Image 
                source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} 
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Welcome Section with Dynamic Name */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Hello, {userProfile ? userProfile.firstName : 'there'}! 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>Find the perfect salon for your style</Text>
          {shops.length > 0 && (
            <Text style={styles.shopsCount}>{shops.length} shops available</Text>
          )}
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => navigation?.navigate('Search')}
        >
          <View style={styles.searchContent}>
            <Ionicons name="search" size={20} color="#666" />
            <Text style={styles.searchText}>Search salons, services, or styles...</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Popular Shops Section */}
        {shops.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Near You</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={getPopularShops()}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.horizontalListContainer}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.shopCard}
                  onPress={() => handleShopPress(item)}
                >
                  <View style={styles.shopImageContainer}>
                    <Image 
                      source={{ uri: item.image }} 
                      style={styles.shopImage} 
                      resizeMode="cover"
                    />
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>{item.distance}</Text>
                    </View>
                  </View>
                  <View style={styles.shopDetails}>
                    <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.ratingPriceContainer}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                      <Text style={styles.priceText}>{item.price}</Text>
                    </View>
                    <Text style={styles.servicesText} numberOfLines={1}>{item.services}</Text>
                    <Text style={styles.cityText} numberOfLines={1}>{item.city}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Top Rated Section */}
        {shops.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Rated This Week</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={getTopRatedShops()}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.horizontalListContainer}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.shopCard, styles.topRatedCard]}
                  onPress={() => handleShopPress(item)}
                >
                  <View style={styles.shopImageContainer}>
                    <Image 
                      source={{ uri: item.image }} 
                      style={styles.shopImage} 
                      resizeMode="cover"
                    />
                    <View style={styles.topRatedBadge}>
                      <Ionicons name="trophy" size={12} color="#FFF" />
                    </View>
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>{item.distance}</Text>
                    </View>
                  </View>
                  <View style={styles.shopDetails}>
                    <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.ratingPriceContainer}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                      <Text style={styles.priceText}>{item.price}</Text>
                    </View>
                    <Text style={styles.servicesText} numberOfLines={1}>{item.services}</Text>
                    <Text style={styles.cityText} numberOfLines={1}>{item.city}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Trending Designs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Styles</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={trendingDesigns}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalListContainer}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.designCard}>
                <View style={styles.designImageContainer}>
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.designImage} 
                    resizeMode="cover"
                  />
                  <View style={styles.popularityBadge}>
                    <Text style={styles.popularityText}>{item.popularity}</Text>
                  </View>
                </View>
                <Text style={styles.designName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Special Offer */}
        <View style={styles.specialOfferContainer}>
          <View style={styles.specialOffer}>
            <View style={styles.offerContent}>
              <View style={styles.offerIcon}>
                <Ionicons name="gift" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.offerTextContainer}>
                <Text style={styles.offerTitle}>First Booking Special!</Text>
                <Text style={styles.offerDescription}>Get 20% off on your first salon booking</Text>
                <Text style={styles.offerCode}>Use code: FIRST20</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bookNowButton} onPress={() => router.push('/Screens/User/BookNow')}>
              <Text style={styles.bookNowText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  navContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    marginRight: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginHorizontal: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginRight: 12,
  },
  notificationButton: {
    marginRight: 12,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  profileButton: {
    marginLeft: 8,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  scrollContainer: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  shopsCount: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
    marginTop: 4,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchText: {
    marginLeft: 12,
    color: '#999',
    fontSize: 15,
    fontWeight: '400',
  },
  filterButton: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
  },
  retryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  horizontalListContainer: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  shopCard: {
    width: 220,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  topRatedCard: {
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  shopImageContainer: {
    position: 'relative',
  },
  shopImage: {
    width: '100%',
    height: 140,
  },
  distanceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '500',
  },
  topRatedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFD700',
    padding: 6,
    borderRadius: 12,
  },
  shopDetails: {
    padding: 16,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  ratingPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  priceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  servicesText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '400',
    marginBottom: 4,
  },
  cityText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
  },
  designCard: {
    width: 160,
    marginRight: 12,
  },
  designImageContainer: {
    position: 'relative',
  },
  designImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  popularityBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,107,107,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularityText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  designName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  specialOfferContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  specialOffer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  offerContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  offerIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  offerTextContainer: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  offerCode: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  bookNowButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookNowText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default Home;
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { EditPenIcon } from './icons/MenuIcons';
import { MENU_ITEMS, type MenuItem } from '../data/menu';
import { useAppData } from '../state/AppDataProvider';
import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing, typography } from '../theme';
import { photoOf } from '../utils/images';

/** The drawer measures 315pt of white with 8pt of gradient behind its right
 *  edge, so the whole thing is 323pt wide (Figma nodes 110:13003, 110:13001). */
const PANEL_WIDTH = 315;
const DRAWER_WIDTH = 323;
const SPINE_LEFT = 77;
const SPINE_WIDTH = 246;
const AVATAR_SIZE = 56;
const PEN_SIZE = 16;
const ITEM_ICON_SIZE = 18;
/** The collapse handle bulging off the panel's right edge (node 110:13020). */
const HANDLE_LEFT = 292.41;
const HANDLE_WIDTH = 30.2715;
const HANDLE_HEIGHT = 141.204;
const GRIP_LENGTH = 34;
/** The drawer slides in from the left edge; out is a touch quicker than in. */
const OPEN_DURATION = 260;
const CLOSE_DURATION = 200;

type MenuSidebarProps = {
  visible: boolean;
  /** The scrim, the handle and the Android back button all collapse it. */
  onCollapse: () => void;
  onSelect?: (item: MenuItem) => void;
  onEditProfile?: () => void;
};

/**
 * The slide-in navigation drawer the Menu tab opens: the astrologer's profile
 * over the ten menu entries, with a gradient handle for collapsing it again.
 * Figma: node 110:13000, over the scrim at node 110:12999.
 */
export function MenuSidebar({
  visible,
  onCollapse,
  onSelect,
  onEditProfile,
}: MenuSidebarProps) {
  const insets = useSafeAreaInsets();
  const { px } = useResponsive();
  const styles = useMemo(() => createStyles(px), [px]);
  const drawerWidth = px(DRAWER_WIDTH);

  /** The signed-in astrologer, once AppDataProvider's fetch resolves; blank until then. */
  const { profile } = useAppData();
  const name = profile.fullName;
  const phone = profile.primaryMobile;
  /**
   * `Modal`'s own slide animation always comes up from the bottom, so the drawer
   * is animated by hand: it travels in from the left edge while the scrim fades
   * up behind it. `mounted` outlives `visible` so the exit can play out.
   */
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: OPEN_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: CLOSE_DURATION,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [visible, progress]);

  const slide = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onCollapse}
      statusBarTranslucent
    >
      <View style={styles.stage}>
        <Animated.View
          style={[styles.drawer, { transform: [{ translateX: slide }] }]}
        >
          {/* The gradient spine sits behind the panel and shows as an 8pt
              sliver down its right edge. */}
          <View style={styles.spine} pointerEvents="none" />

          <View style={styles.panel}>
            <View style={[styles.profile, { paddingTop: insets.top + px(24.45) }]}>
              <Image
                accessibilityLabel={name}
                source={photoOf(profile.photoUrl, require('../assets/images/menu-avatar.png'))}
                style={styles.avatar}
              />

              <View style={styles.identity}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.phone}>{phone}</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit profile"
                onPress={onEditProfile}
                hitSlop={spacing.sm}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <EditPenIcon size={px(PEN_SIZE)} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.items,
                { paddingBottom: spacing.xl + insets.bottom },
              ]}
            >
              {MENU_ITEMS.map(item => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={() => onSelect?.(item)}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.itemIcon}>
                    <item.Icon size={px(ITEM_ICON_SIZE)} />
                  </View>
                  <Text
                    style={[
                      styles.itemLabel,
                      item.destructive && styles.itemLabelDestructive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Collapse menu"
            onPress={onCollapse}
            style={styles.handle}
          >
            <CollapseHandle size={px(HANDLE_WIDTH)} />
            <View style={styles.grip} />
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.scrim, { opacity: progress }]}>
          <Pressable
            style={styles.scrimTouch}
            onPress={onCollapse}
            accessibilityLabel="Close menu"
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

/** The teardrop the handle is cut from (Figma node 110:13020). */
function CollapseHandle({ size = HANDLE_WIDTH }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={(size / HANDLE_WIDTH) * HANDLE_HEIGHT}
      viewBox="0 0 30.2715 141.204"
      fill="none"
    >
      <Defs>
        <LinearGradient
          id="menu-handle"
          x1="30.2715"
          y1="1.5541"
          x2="-0.618114"
          y2="1.69228"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={colors.gradient.from} />
          <Stop offset="1" stopColor={colors.gradient.to} />
        </LinearGradient>
      </Defs>
      <Path
        d="M22.2715 22C23.2877 17.9355 23.1331 9.57572 23.0398 3.63535C23.0082 1.62763 24.6278 0 26.6357 0C28.6437 0 30.2715 1.62777 30.2715 3.63574V137.568C30.2715 139.495 28.7689 141.087 26.8457 141.198C24.7587 141.319 23.0155 139.661 22.929 137.572C22.5873 129.329 20.7129 118.233 11.2715 104.5C-5.61327 85.6288 1.17776 65.2778 2.25038 62.0634L2.27153 62C3.27153 59 20.7715 28 22.2715 22Z"
        fill="url(#menu-handle)"
      />
    </Svg>
  );
}

/**
 * The drawer is a fixed-width panel anchored to the left edge — that's
 * already tablet-safe (a nav drawer staying a comfortable fixed width on a
 * wide screen is the normal pattern), so only `px` scales it for small
 * phones rather than reflowing on `isTablet`.
 */
function createStyles(px: (value: number) => number) {
  const handleWidth = px(HANDLE_WIDTH);
  const handleHeight = px(HANDLE_HEIGHT);

  return StyleSheet.create({
    stage: {
      flex: 1,
      flexDirection: 'row',
    },
    drawer: {
      width: px(DRAWER_WIDTH),
    },
    spine: {
      position: 'absolute',
      left: px(SPINE_LEFT),
      top: 1,
      bottom: 1,
      width: px(SPINE_WIDTH),
      borderRadius: radius.button,
      // Painted flat rather than as a ramp: only its right sliver is ever visible.
      backgroundColor: colors.gradient.from,
    },
    panel: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: px(PANEL_WIDTH),
      borderRadius: radius.input,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    profile: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: px(24.32),
      paddingRight: spacing.section,
      paddingBottom: spacing.lg,
    },
    avatar: {
      width: px(AVATAR_SIZE),
      height: px(AVATAR_SIZE),
      borderRadius: px(AVATAR_SIZE) / 2,
    },
    identity: {
      flex: 1,
      paddingLeft: px(18.42),
    },
    name: {
      ...typography.menuLabel,
      color: colors.text.sheet,
    },
    phone: {
      ...typography.menuMeta,
      color: colors.text.slateMuted,
      opacity: 0.4,
      paddingTop: 2,
    },
    pressed: {
      opacity: 0.6,
    },
    items: {
      paddingLeft: px(22.29),
      paddingRight: spacing.section,
      paddingBottom: spacing.xl,
      gap: spacing.xl,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // Figma seats each label 31.3pt from the icon's left edge (node 110:13024).
    itemIcon: {
      width: px(31.3),
      justifyContent: 'center',
    },
    itemLabel: {
      ...typography.menuLabel,
      color: colors.text.sheet,
    },
    itemLabelDestructive: {
      color: colors.delete,
    },
    handle: {
      position: 'absolute',
      left: px(HANDLE_LEFT),
      top: '50%',
      marginTop: -handleHeight / 2,
      width: handleWidth,
      height: handleHeight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // The 3pt ink grip Figma rotates upright at the handle's centre (110:13021).
    grip: {
      position: 'absolute',
      width: px(3),
      height: px(GRIP_LENGTH),
      borderRadius: px(1.5),
      backgroundColor: colors.text.ink,
      left: handleWidth - px(7.5),
    },
    scrim: {
      flex: 1,
      backgroundColor: colors.scrim,
    },
    scrimTouch: {
      flex: 1,
    },
  });
}

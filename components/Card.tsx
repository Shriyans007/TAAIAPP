import { PropsWithChildren } from 'react'; import { StyleSheet, View } from 'react-native'; import { colors, radius, shadows, spacing } from '@/theme';
export function Card({children}:{children:React.ReactNode}){return <View style={s.card}>{children}</View>} const s=StyleSheet.create({card:{backgroundColor:colors.surface,borderRadius:radius.xl,padding:spacing.lg,borderWidth:1,borderColor:colors.border,...shadows.card}});


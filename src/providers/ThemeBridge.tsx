
'use client'; import type {PropsWithChildren} from 'react'; import {useShell} from './ShellProvider'; import KoaliThemeProvider from './KoaliThemeProvider'; export default function ThemeBridge({children}:PropsWithChildren){const {state}=useShell();return <KoaliThemeProvider theme={state.active_theme}>{children}</KoaliThemeProvider>}

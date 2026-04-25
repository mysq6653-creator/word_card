import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, useThemeColors } from '../src/lib/theme';
import { useCardStore } from '../src/store/useCardStore';
import { ui } from '../src/data/ui';
import type { Lang } from '../src/data/words';

const privacyBody: Record<Lang, string> = {
  ko: `낱말 카드 앱 개인정보 처리방침

최종 수정일: 2025년 4월

1. 수집하는 정보
본 앱은 사용자의 마이크를 통해 음성을 녹음할 수 있습니다. 녹음된 음성은 기기 내부에만 저장되며, 외부 서버로 전송되지 않습니다.
사진 앨범에서 선택한 이미지는 기기 내부에만 저장됩니다.

2. 정보의 사용 목적
녹음된 음성은 낱말 카드의 발음 재생에만 사용됩니다. 부모님이 직접 녹음한 목소리로 아이에게 단어를 들려줄 수 있습니다.

3. 정보의 저장
- 모바일: 기기 내부 저장소 (앱 삭제 시 함께 삭제)
- 웹: 브라우저 IndexedDB (브라우저 데이터 삭제 시 함께 삭제)
어떠한 개인 데이터도 외부 서버에 저장되거나 전송되지 않습니다.

4. 정보의 삭제
설정 > 데이터 관리에서 녹음, 사진, 커스텀 카드를 삭제할 수 있습니다. 개별 카드의 녹음은 각 카드에서 삭제할 수 있습니다.

5. 아동 개인정보 보호 (COPPA 준수)
본 앱은 영유아 교육을 목적으로 합니다. 아동의 개인정보를 수집하지 않으며, 계정 생성이나 로그인이 필요하지 않습니다. 아동의 정보가 외부로 유출되지 않습니다.

6. 광고
본 앱은 Google AdMob을 통해 보상형 광고를 표시할 수 있습니다. 광고는 아동 대상 설정(COPPA)에 따라 개인화되지 않은 광고만 표시됩니다. 광고 시청은 사용자가 직접 선택한 경우에만 표시됩니다.

7. 인앱 구매
프리미엄 구독 및 영구 구매가 제공됩니다. 결제는 Apple App Store 또는 Google Play Store를 통해 안전하게 처리되며, 결제 정보는 본 앱에서 수집하지 않습니다.

8. 제3자 SDK
- Google AdMob: 보상형 광고 표시 (비개인화 광고만)
- Apple StoreKit / Google Play Billing: 인앱 구매 처리

9. 변경 사항
본 방침이 변경될 경우 앱 업데이트를 통해 안내합니다.

10. 문의
개인정보 관련 문의사항이 있으시면 앱스토어 리뷰 또는 개발자 연락처로 문의해 주세요.`,

  en: `Word Card App Privacy Policy

Last updated: April 2025

1. Information We Collect
This app can record audio through your device's microphone. All recordings are stored locally on your device only and are never sent to any external server.
Images selected from your photo album are also stored locally only.

2. How We Use Information
Recorded audio is used solely for playing pronunciation on word cards. Parents can record their own voice to play for their child.

3. Data Storage
- Mobile: Device internal storage (deleted when app is uninstalled)
- Web: Browser IndexedDB (deleted when browser data is cleared)
No personal data is stored on or transmitted to external servers.

4. Data Deletion
You can delete recordings, photos, and custom cards through Settings > Data Manager. Individual card recordings can be deleted from each card.

5. Children's Privacy (COPPA Compliance)
This app is designed for early childhood education. We do not collect any personal information from children. No account creation or login is required. No child data is exposed externally.

6. Advertising
This app may display rewarded ads through Google AdMob. Ads are shown only when the user explicitly chooses to watch them. In compliance with COPPA, only non-personalized ads are served.

7. In-App Purchases
Premium subscriptions and a lifetime purchase option are available. Payments are processed securely through Apple App Store or Google Play Store. No payment information is collected by this app.

8. Third-Party SDKs
- Google AdMob: Rewarded ad display (non-personalized ads only)
- Apple StoreKit / Google Play Billing: In-app purchase processing

9. Changes
Any changes to this policy will be communicated through app updates.

10. Contact
For privacy-related inquiries, please reach out through the app store review or developer contact.`,

  ja: `単語カード アプリ プライバシーポリシー

最終更新日: 2025年4月

1. 収集する情報
本アプリはデバイスのマイクを通じて音声を録音できます。録音された音声はデバイス内部にのみ保存され、外部サーバーに送信されることはありません。
フォトアルバムから選択した画像もデバイス内部にのみ保存されます。

2. 情報の使用目的
録音された音声は、単語カードの発音再生にのみ使用されます。保護者が自分の声を録音してお子様に聞かせることができます。

3. 情報の保存
- モバイル: デバイス内部ストレージ（アプリ削除時に削除）
- Web: ブラウザIndexedDB（ブラウザデータ削除時に削除）
個人データは外部サーバーに保存・送信されません。

4. 情報の削除
設定 > データ管理から録音、写真、カスタムカードを削除できます。個別のカードの録音は各カードから削除できます。

5. お子様のプライバシー（COPPA準拠）
本アプリは幼児教育を目的としています。お子様の個人情報を収集しません。アカウント作成やログインは不要です。

6. 広告
Google AdMobを通じてリワード広告を表示することがあります。COPPAに準拠し、パーソナライズされていない広告のみ表示されます。広告はユーザーが選択した場合のみ表示されます。

7. アプリ内購入
プレミアム購入オプションがあります。決済はApple App StoreまたはGoogle Play Storeを通じて安全に処理されます。

8. サードパーティSDK
- Google AdMob: リワード広告表示（非パーソナライズ広告のみ）
- Apple StoreKit / Google Play Billing: アプリ内購入処理

9. 変更事項
本ポリシーの変更はアプリのアップデートを通じてお知らせします。

10. お問い合わせ
プライバシーに関するお問い合わせは、アプリストアのレビューまたは開発者連絡先までご連絡ください。`,

  es: `Política de Privacidad de la App Tarjeta de Palabras

Última actualización: abril de 2025

1. Información que recopilamos
Esta app puede grabar audio a través del micrófono de su dispositivo. Todas las grabaciones se almacenan localmente en su dispositivo y nunca se envían a ningún servidor externo.
Las imágenes seleccionadas de su álbum de fotos también se almacenan solo localmente.

2. Cómo usamos la información
El audio grabado se usa únicamente para reproducir la pronunciación en las tarjetas de palabras. Los padres pueden grabar su propia voz para reproducirla a sus hijos.

3. Almacenamiento de datos
- Móvil: Almacenamiento interno del dispositivo (se elimina al desinstalar la app)
- Web: IndexedDB del navegador (se elimina al borrar datos del navegador)
Ningún dato personal se almacena o transmite a servidores externos.

4. Eliminación de datos
Puede eliminar grabaciones, fotos y tarjetas personalizadas en Ajustes > Gestión de datos. Las grabaciones individuales se pueden eliminar desde cada tarjeta.

5. Privacidad infantil (Cumplimiento COPPA)
Esta app está diseñada para la educación infantil temprana. No recopilamos información personal de niños. No se requiere creación de cuenta ni inicio de sesión.

6. Publicidad
Esta app puede mostrar anuncios con recompensa a través de Google AdMob. Solo se muestran anuncios no personalizados, cumpliendo con COPPA. Los anuncios solo se muestran cuando el usuario elige verlos.

7. Compras dentro de la app
Se ofrecen opciones de compra premium. Los pagos se procesan de forma segura a través de Apple App Store o Google Play Store.

8. SDKs de terceros
- Google AdMob: Anuncios con recompensa (solo no personalizados)
- Apple StoreKit / Google Play Billing: Procesamiento de compras

9. Cambios
Los cambios en esta política se comunicarán a través de actualizaciones de la app.

10. Contacto
Para consultas sobre privacidad, comuníquese a través de la reseña de la tienda de apps o el contacto del desarrollador.`,

  zh: `单词卡片应用隐私政策

最后更新日期：2025年4月

1. 我们收集的信息
本应用可以通过设备麦克风录制音频。所有录音仅存储在您的设备本地，不会发送到任何外部服务器。
从相册选择的图片也仅存储在本地。

2. 信息使用方式
录制的音频仅用于单词卡片的发音播放。家长可以录制自己的声音播放给孩子听。

3. 数据存储
- 移动端：设备内部存储（卸载应用时删除）
- 网页端：浏览器IndexedDB（清除浏览器数据时删除）
不会在外部服务器上存储或传输任何个人数据。

4. 数据删除
您可以通过设置 > 数据管理删除录音、照片和自定义卡片。单个卡片的录音可以从每张卡片中删除。

5. 儿童隐私（COPPA合规）
本应用面向幼儿教育。我们不收集任何儿童个人信息。无需创建账户或登录。

6. 广告
本应用可能通过Google AdMob展示激励广告。遵循COPPA规定，仅展示非个性化广告。广告仅在用户主动选择观看时展示。

7. 应用内购买
提供高级版购买选项。付款通过Apple App Store或Google Play Store安全处理。

8. 第三方SDK
- Google AdMob：激励广告展示（仅非个性化广告）
- Apple StoreKit / Google Play Billing：应用内购买处理

9. 变更
本政策的任何变更将通过应用更新通知。

10. 联系方式
如有隐私相关问题，请通过应用商店评论或开发者联系方式联系我们。`,

  fr: `Politique de confidentialité de l'application Carte de Mots

Dernière mise à jour : avril 2025

1. Informations collectées
Cette application peut enregistrer de l'audio via le microphone de votre appareil. Tous les enregistrements sont stockés uniquement sur votre appareil et ne sont jamais envoyés à un serveur externe.
Les images sélectionnées depuis votre album photo sont également stockées uniquement en local.

2. Utilisation des informations
L'audio enregistré est utilisé uniquement pour la lecture de la prononciation sur les cartes de mots. Les parents peuvent enregistrer leur propre voix pour la faire écouter à leur enfant.

3. Stockage des données
- Mobile : Stockage interne de l'appareil (supprimé lors de la désinstallation)
- Web : IndexedDB du navigateur (supprimé lors de l'effacement des données)
Aucune donnée personnelle n'est stockée ou transmise à des serveurs externes.

4. Suppression des données
Vous pouvez supprimer les enregistrements, photos et cartes personnalisées dans Paramètres > Gestion des données.

5. Vie privée des enfants (Conformité COPPA)
Cette application est conçue pour l'éducation de la petite enfance. Nous ne collectons aucune information personnelle des enfants. Aucune création de compte ni connexion n'est requise.

6. Publicité
Cette application peut afficher des publicités récompensées via Google AdMob. Conformément à la COPPA, seules des publicités non personnalisées sont diffusées. Les publicités ne s'affichent que lorsque l'utilisateur choisit de les regarder.

7. Achats intégrés
Des options d'achat premium sont disponibles. Les paiements sont traités de manière sécurisée via l'Apple App Store ou le Google Play Store.

8. SDK tiers
- Google AdMob : Publicités récompensées (non personnalisées uniquement)
- Apple StoreKit / Google Play Billing : Traitement des achats

9. Modifications
Toute modification de cette politique sera communiquée via les mises à jour de l'application.

10. Contact
Pour toute question relative à la vie privée, veuillez nous contacter via l'avis de l'App Store ou le contact du développeur.`,

  de: `Datenschutzrichtlinie der Wortkarte-App

Letzte Aktualisierung: April 2025

1. Erfasste Informationen
Diese App kann Audio über das Mikrofon Ihres Geräts aufnehmen. Alle Aufnahmen werden nur lokal auf Ihrem Gerät gespeichert und niemals an externe Server gesendet.
Aus dem Fotoalbum ausgewählte Bilder werden ebenfalls nur lokal gespeichert.

2. Verwendung der Informationen
Aufgenommenes Audio wird ausschließlich für die Aussprache-Wiedergabe auf Wortkarten verwendet. Eltern können ihre eigene Stimme aufnehmen, um sie ihrem Kind vorzuspielen.

3. Datenspeicherung
- Mobil: Interner Gerätespeicher (wird bei App-Deinstallation gelöscht)
- Web: Browser-IndexedDB (wird beim Löschen der Browserdaten gelöscht)
Keine persönlichen Daten werden auf externen Servern gespeichert oder übertragen.

4. Datenlöschung
Sie können Aufnahmen, Fotos und benutzerdefinierte Karten unter Einstellungen > Datenverwaltung löschen.

5. Datenschutz für Kinder (COPPA-Konformität)
Diese App dient der frühkindlichen Bildung. Wir erfassen keine persönlichen Informationen von Kindern. Keine Kontoerstellung oder Anmeldung erforderlich.

6. Werbung
Diese App kann Belohnungswerbung über Google AdMob anzeigen. Gemäß COPPA werden nur nicht personalisierte Anzeigen geschaltet. Werbung wird nur angezeigt, wenn der Benutzer sich aktiv dafür entscheidet.

7. In-App-Käufe
Premium-Kaufoptionen sind verfügbar. Zahlungen werden sicher über den Apple App Store oder Google Play Store abgewickelt.

8. Drittanbieter-SDKs
- Google AdMob: Belohnungswerbung (nur nicht personalisiert)
- Apple StoreKit / Google Play Billing: In-App-Kauf-Verarbeitung

9. Änderungen
Änderungen an dieser Richtlinie werden über App-Updates mitgeteilt.

10. Kontakt
Bei datenschutzbezogenen Anfragen kontaktieren Sie uns bitte über die App-Store-Bewertung oder den Entwicklerkontakt.`,

  pt: `Política de Privacidade do App Cartão de Palavras

Última atualização: abril de 2025

1. Informações que coletamos
Este app pode gravar áudio através do microfone do seu dispositivo. Todas as gravações são armazenadas apenas localmente no seu dispositivo e nunca são enviadas para qualquer servidor externo.
Imagens selecionadas do seu álbum de fotos também são armazenadas apenas localmente.

2. Como usamos as informações
O áudio gravado é usado exclusivamente para reproduzir a pronúncia nos cartões de palavras. Os pais podem gravar sua própria voz para reproduzir para seus filhos.

3. Armazenamento de dados
- Móvel: Armazenamento interno do dispositivo (excluído ao desinstalar o app)
- Web: IndexedDB do navegador (excluído ao limpar dados do navegador)
Nenhum dado pessoal é armazenado ou transmitido para servidores externos.

4. Exclusão de dados
Você pode excluir gravações, fotos e cartões personalizados em Configurações > Gerenciador de dados.

5. Privacidade infantil (Conformidade COPPA)
Este app é projetado para educação infantil. Não coletamos informações pessoais de crianças. Não é necessária criação de conta ou login.

6. Publicidade
Este app pode exibir anúncios com recompensa através do Google AdMob. Em conformidade com a COPPA, apenas anúncios não personalizados são exibidos. Os anúncios são mostrados apenas quando o usuário escolhe assisti-los.

7. Compras no app
Opções de compra premium estão disponíveis. Os pagamentos são processados com segurança através da Apple App Store ou Google Play Store.

8. SDKs de terceiros
- Google AdMob: Exibição de anúncios com recompensa (apenas não personalizados)
- Apple StoreKit / Google Play Billing: Processamento de compras

9. Alterações
Quaisquer alterações nesta política serão comunicadas através de atualizações do app.

10. Contato
Para consultas relacionadas à privacidade, entre em contato através da avaliação da loja de apps ou contato do desenvolvedor.`,
};

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const lang = useCardStore((s) => s.lang);

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}
    >
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backBtn,
          { backgroundColor: colors.surface },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={[styles.backText, { color: colors.text }]}>
          {`← ${ui('back', lang)}`}
        </Text>
      </Pressable>

      <Text style={[styles.title, { color: colors.text }]}>
        {`📋 ${ui('privacyPolicy', lang)}`}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.body, { color: colors.text }]}>
          {privacyBody[lang] ?? privacyBody.en}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 16 },
  backBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md },
  backText: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800' },
  card: { borderRadius: radius.md, padding: 20 },
  body: { fontSize: 15, lineHeight: 24 },
});

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, useThemeColors } from '../src/lib/theme';
import { useCardStore } from '../src/store/useCardStore';
import { ui } from '../src/data/ui';
import type { Lang } from '../src/data/words';

const privacyBody: Record<Lang, string> = {
  ko: `낱말 카드 앱 개인정보 처리방침

최종 수정일: 2026년 6월

본 앱은 회원가입이나 로그인이 없으며, 이름·이메일·전화번호 등 개인 식별 정보를 수집하지 않습니다.

1. 수집하는 정보
- 마이크 녹음: 부모님이 낱말 발음을 직접 녹음할 수 있습니다. 녹음 파일은 기기 내부에만 저장되며 외부 서버로 전송되지 않습니다.
- 사진: 나만의 카드에 사진을 추가할 수 있습니다. 선택한 이미지는 기기 내부에만 저장됩니다.

2. 정보의 저장 및 삭제
모든 녹음·사진·커스텀 카드는 기기 내부 저장소(웹은 브라우저 IndexedDB)에만 보관되며, 앱 삭제 시 함께 삭제됩니다. 설정 > 데이터 관리에서 언제든지 직접 삭제할 수 있습니다.

3. 아동 개인정보 보호 (COPPA / GDPR-K 준수)
본 앱은 영유아 교육을 목적으로 하며, 아동의 개인정보를 수집하지 않습니다. 계정 생성이나 로그인이 필요하지 않으며, 아동의 정보가 외부로 유출되지 않습니다.

4. 광고
본 앱은 Google AdMob을 통해 보상형 광고를 표시할 수 있습니다. 광고는 이용자가 직접 시청을 선택한 경우에만 표시됩니다. 아동 대상 앱 정책(COPPA)에 따라 개인 맞춤화되지 않은 광고만 제공됩니다.

5. 인앱 구매
프리미엄 영구 이용권(Lifetime Pass) 1회성 구매가 제공됩니다. 자동 갱신 구독 상품은 없습니다. 결제는 Google Play를 통해 안전하게 처리되며, 본 앱은 결제 정보를 수집하거나 저장하지 않습니다.

6. 제3자 서비스
- Google AdMob: 보상형 광고 표시 (비개인화 광고만)
- Google Play 결제: 인앱 구매 처리

7. 변경 사항
본 방침이 변경될 경우 앱 업데이트 또는 본 페이지를 통해 안내합니다.

8. 문의
개인정보 관련 문의: mysq6653@gmail.com`,

  en: `Word Card App Privacy Policy

Last updated: June 2026

The app has no sign-up or login and does not collect any personally identifiable information such as name, email, or phone number.

1. Information We Collect
- Microphone recordings: Parents may record word pronunciations. Recordings are stored only on the device and are never sent to any external server.
- Photos: You may add photos to your own cards. Selected images are stored only on the device.

2. Data Storage and Deletion
All recordings, photos, and custom cards are stored only in the device's internal storage (or the browser's IndexedDB on web) and are removed when the app is uninstalled. You can also delete them anytime via Settings > Data Manager.

3. Children's Privacy (COPPA / GDPR-K Compliance)
This app is designed for early childhood education and does not collect any personal information from children. No account creation or login is required, and no child data is exposed externally.

4. Advertising
This app may display rewarded ads through Google AdMob. Ads appear only when the user explicitly chooses to watch them. In compliance with child-directed policies (COPPA), only non-personalized ads are served.

5. In-App Purchases
A one-time Premium Lifetime Pass is offered. There are no auto-renewing subscriptions. Payments are processed securely through Google Play, and the app does not collect or store any payment information.

6. Third-Party Services
- Google AdMob: Rewarded ad display (non-personalized ads only)
- Google Play Billing: In-app purchase processing

7. Changes
Any changes to this policy will be communicated through app updates or on this page.

8. Contact
Privacy inquiries: mysq6653@gmail.com`,

  ja: `単語カード アプリ プライバシーポリシー

最終更新日: 2026年6月

本アプリは会員登録やログインがなく、氏名・メールアドレス・電話番号などの個人識別情報を収集しません。

1. 収集する情報
- マイク録音: 保護者が単語の発音を録音できます。録音ファイルはデバイス内部にのみ保存され、外部サーバーに送信されません。
- 写真: カスタムカードに写真を追加できます。選択した画像はデバイス内部にのみ保存されます。

2. 情報の保存と削除
すべての録音・写真・カスタムカードはデバイス内部ストレージ（Webの場合はブラウザのIndexedDB）にのみ保存され、アプリ削除時に削除されます。設定 > データ管理からいつでも削除できます。

3. お子様のプライバシー（COPPA / GDPR-K準拠）
本アプリは幼児教育を目的としており、お子様の個人情報を収集しません。アカウント作成やログインは不要で、お子様の情報が外部に漏れることはありません。

4. 広告
本アプリはGoogle AdMobを通じてリワード広告を表示することがあります。広告はユーザーが視聴を選択した場合のみ表示されます。児童向けポリシー（COPPA）に準拠し、パーソナライズされていない広告のみ表示されます。

5. アプリ内購入
プレミアム永久購入（Lifetime Pass）の一回限りの購入が提供されます。自動更新サブスクリプションはありません。決済はGoogle Playを通じて安全に処理され、本アプリは決済情報を収集・保存しません。

6. 第三者サービス
- Google AdMob: リワード広告表示（非パーソナライズ広告のみ）
- Google Play決済: アプリ内購入処理

7. 変更事項
本ポリシーの変更はアプリのアップデートまたは本ページを通じてお知らせします。

8. お問い合わせ
プライバシーに関するお問い合わせ: mysq6653@gmail.com`,

  es: `Política de Privacidad de la App Tarjeta de Palabras

Última actualización: junio de 2026

La app no tiene registro ni inicio de sesión y no recopila información de identificación personal como nombre, correo o teléfono.

1. Información que recopilamos
- Grabaciones de micrófono: Los padres pueden grabar pronunciaciones. Las grabaciones se almacenan solo en el dispositivo y nunca se envían a servidores externos.
- Fotos: Puede agregar fotos a sus tarjetas. Las imágenes seleccionadas se almacenan solo en el dispositivo.

2. Almacenamiento y eliminación de datos
Todas las grabaciones, fotos y tarjetas personalizadas se almacenan solo en el almacenamiento interno del dispositivo (o IndexedDB del navegador en web) y se eliminan al desinstalar la app. También puede eliminarlas en cualquier momento en Ajustes > Gestión de datos.

3. Privacidad infantil (Cumplimiento COPPA / GDPR-K)
Esta app está diseñada para la educación infantil temprana y no recopila información personal de niños. No se requiere cuenta ni inicio de sesión, y ningún dato infantil se expone externamente.

4. Publicidad
Esta app puede mostrar anuncios con recompensa a través de Google AdMob. Los anuncios aparecen solo cuando el usuario elige verlos. Conforme a las políticas para niños (COPPA), solo se muestran anuncios no personalizados.

5. Compras dentro de la app
Se ofrece una compra única Premium de por vida (Lifetime Pass). No hay suscripciones de renovación automática. Los pagos se procesan de forma segura a través de Google Play, y la app no recopila ni almacena información de pago.

6. Servicios de terceros
- Google AdMob: Anuncios con recompensa (solo no personalizados)
- Google Play Billing: Procesamiento de compras

7. Cambios
Los cambios en esta política se comunicarán mediante actualizaciones de la app o en esta página.

8. Contacto
Consultas de privacidad: mysq6653@gmail.com`,

  zh: `单词卡片应用隐私政策

最后更新日期：2026年6月

本应用没有注册或登录，不收集姓名、邮箱、电话等个人身份信息。

1. 我们收集的信息
- 麦克风录音：家长可以录制单词发音。录音文件仅存储在设备本地，不会发送到任何外部服务器。
- 照片：您可以向自定义卡片添加照片。所选图片仅存储在设备本地。

2. 数据存储与删除
所有录音、照片和自定义卡片仅存储在设备内部存储（网页端为浏览器IndexedDB），卸载应用时一并删除。您也可以随时在设置 > 数据管理中删除。

3. 儿童隐私（COPPA / GDPR-K合规）
本应用面向幼儿教育，不收集任何儿童个人信息。无需创建账户或登录，儿童信息不会外泄。

4. 广告
本应用可能通过Google AdMob展示激励广告。广告仅在用户主动选择观看时显示。遵循儿童相关政策（COPPA），仅展示非个性化广告。

5. 应用内购买
提供高级版永久购买（Lifetime Pass）一次性购买。没有自动续费订阅。付款通过Google Play安全处理，本应用不收集或存储任何付款信息。

6. 第三方服务
- Google AdMob：激励广告展示（仅非个性化广告）
- Google Play结算：应用内购买处理

7. 变更
本政策的任何变更将通过应用更新或本页面通知。

8. 联系方式
隐私相关问题：mysq6653@gmail.com`,

  fr: `Politique de confidentialité de l'application Carte de Mots

Dernière mise à jour : juin 2026

L'application n'a ni inscription ni connexion et ne collecte aucune information d'identification personnelle telle que nom, e-mail ou téléphone.

1. Informations collectées
- Enregistrements micro : Les parents peuvent enregistrer des prononciations. Les enregistrements sont stockés uniquement sur l'appareil et ne sont jamais envoyés à des serveurs externes.
- Photos : Vous pouvez ajouter des photos à vos cartes. Les images sélectionnées sont stockées uniquement sur l'appareil.

2. Stockage et suppression des données
Tous les enregistrements, photos et cartes personnalisées sont stockés uniquement dans le stockage interne de l'appareil (ou l'IndexedDB du navigateur sur le web) et sont supprimés lors de la désinstallation. Vous pouvez aussi les supprimer à tout moment via Paramètres > Gestion des données.

3. Vie privée des enfants (Conformité COPPA / GDPR-K)
Cette application est conçue pour l'éducation de la petite enfance et ne collecte aucune information personnelle des enfants. Aucune création de compte ni connexion n'est requise, et aucune donnée d'enfant n'est exposée à l'extérieur.

4. Publicité
Cette application peut afficher des publicités récompensées via Google AdMob. Les publicités n'apparaissent que lorsque l'utilisateur choisit de les regarder. Conformément aux politiques pour enfants (COPPA), seules des publicités non personnalisées sont diffusées.

5. Achats intégrés
Un achat unique Premium à vie (Lifetime Pass) est proposé. Il n'y a pas d'abonnement à renouvellement automatique. Les paiements sont traités de manière sécurisée via Google Play, et l'application ne collecte ni ne stocke aucune information de paiement.

6. Services tiers
- Google AdMob : Publicités récompensées (non personnalisées uniquement)
- Google Play Billing : Traitement des achats

7. Modifications
Toute modification de cette politique sera communiquée via les mises à jour de l'application ou sur cette page.

8. Contact
Questions de confidentialité : mysq6653@gmail.com`,

  de: `Datenschutzrichtlinie der Wortkarte-App

Letzte Aktualisierung: Juni 2026

Die App hat keine Registrierung oder Anmeldung und erfasst keine personenbezogenen Daten wie Name, E-Mail oder Telefonnummer.

1. Erfasste Informationen
- Mikrofonaufnahmen: Eltern können Aussprachen aufnehmen. Aufnahmen werden nur auf dem Gerät gespeichert und niemals an externe Server gesendet.
- Fotos: Sie können Ihren Karten Fotos hinzufügen. Ausgewählte Bilder werden nur auf dem Gerät gespeichert.

2. Datenspeicherung und -löschung
Alle Aufnahmen, Fotos und benutzerdefinierten Karten werden nur im internen Gerätespeicher (bzw. der IndexedDB des Browsers im Web) gespeichert und bei der Deinstallation entfernt. Sie können sie auch jederzeit unter Einstellungen > Datenverwaltung löschen.

3. Datenschutz für Kinder (COPPA / GDPR-K-Konformität)
Diese App dient der frühkindlichen Bildung und erfasst keine persönlichen Informationen von Kindern. Keine Kontoerstellung oder Anmeldung erforderlich, und keine Kinderdaten werden extern offengelegt.

4. Werbung
Diese App kann Belohnungswerbung über Google AdMob anzeigen. Werbung erscheint nur, wenn der Benutzer sich aktiv dafür entscheidet. Gemäß kinderbezogenen Richtlinien (COPPA) werden nur nicht personalisierte Anzeigen geschaltet.

5. In-App-Käufe
Ein einmaliger Premium-Kauf auf Lebenszeit (Lifetime Pass) wird angeboten. Es gibt keine automatisch verlängerten Abonnements. Zahlungen werden sicher über Google Play abgewickelt, und die App erfasst oder speichert keine Zahlungsinformationen.

6. Drittanbieterdienste
- Google AdMob: Belohnungswerbung (nur nicht personalisiert)
- Google Play Billing: In-App-Kauf-Verarbeitung

7. Änderungen
Änderungen an dieser Richtlinie werden über App-Updates oder auf dieser Seite mitgeteilt.

8. Kontakt
Datenschutzanfragen: mysq6653@gmail.com`,

  pt: `Política de Privacidade do App Cartão de Palavras

Última atualização: junho de 2026

O app não tem cadastro ou login e não coleta nenhuma informação de identificação pessoal como nome, e-mail ou telefone.

1. Informações que coletamos
- Gravações de microfone: Os pais podem gravar pronúncias. As gravações são armazenadas apenas no dispositivo e nunca enviadas a servidores externos.
- Fotos: Você pode adicionar fotos aos seus cartões. As imagens selecionadas são armazenadas apenas no dispositivo.

2. Armazenamento e exclusão de dados
Todas as gravações, fotos e cartões personalizados são armazenados apenas no armazenamento interno do dispositivo (ou IndexedDB do navegador na web) e são removidos ao desinstalar o app. Você também pode excluí-los a qualquer momento em Configurações > Gerenciador de dados.

3. Privacidade infantil (Conformidade COPPA / GDPR-K)
Este app é projetado para educação infantil e não coleta informações pessoais de crianças. Não é necessária criação de conta ou login, e nenhum dado infantil é exposto externamente.

4. Publicidade
Este app pode exibir anúncios com recompensa através do Google AdMob. Os anúncios aparecem apenas quando o usuário escolhe assisti-los. Em conformidade com as políticas para crianças (COPPA), apenas anúncios não personalizados são exibidos.

5. Compras no app
Uma compra única Premium vitalícia (Lifetime Pass) é oferecida. Não há assinaturas de renovação automática. Os pagamentos são processados com segurança através do Google Play, e o app não coleta nem armazena informações de pagamento.

6. Serviços de terceiros
- Google AdMob: Exibição de anúncios com recompensa (apenas não personalizados)
- Google Play Billing: Processamento de compras

7. Alterações
Quaisquer alterações nesta política serão comunicadas através de atualizações do app ou nesta página.

8. Contato
Consultas de privacidade: mysq6653@gmail.com`,
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
        accessibilityRole="button"
        accessibilityLabel={ui('back', lang)}
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

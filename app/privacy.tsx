import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, useThemeColors } from '../src/lib/theme';
import { useCardStore } from '../src/store/useCardStore';
import { ui } from '../src/data/ui';
import type { Lang } from '../src/data/words';

const privacyBody: Record<Lang, string> = {
  ko: `낱말 카드 앱 개인정보 처리방침

최종 수정일: 2026년 4월

1. 수집하는 정보
본 앱은 사용자의 마이크를 통해 음성을 녹음할 수 있습니다. 녹음된 음성은 기기 내부에만 저장되며, 외부 서버로 전송되지 않습니다.
사진 앨범에서 선택한 이미지는 기기 내부에만 저장됩니다.
AI 음성 기능을 사용하는 경우, 텍스트 데이터가 ElevenLabs API로 전송되어 음성이 생성됩니다. 생성된 AI 음성 파일은 기기 내부에만 저장됩니다.

2. 정보의 사용 목적
녹음된 음성은 낱말 카드의 발음 재생에만 사용됩니다. 부모님이 직접 녹음한 목소리로 아이에게 단어를 들려줄 수 있습니다.
AI 음성 기능은 8개 언어(한국어, 영어, 일본어, 스페인어, 중국어, 프랑스어, 독일어, 포르투갈어)로 단어의 발음을 생성합니다.

3. 정보의 저장
- 모바일: 기기 내부 저장소 (앱 삭제 시 함께 삭제)
- 웹: 브라우저 IndexedDB (브라우저 데이터 삭제 시 함께 삭제)
음성 녹음 및 사진은 외부 서버에 저장되거나 전송되지 않습니다. AI 음성 생성 시 텍스트 데이터만 ElevenLabs 서버로 전송되며, 생성된 음성 파일은 기기에만 저장됩니다.

4. 정보의 삭제
설정 > 데이터 관리에서 녹음, AI 음성, 사진, 커스텀 카드를 삭제할 수 있습니다. 개별 카드의 녹음 및 AI 음성은 각 카드 편집 화면에서 삭제할 수 있습니다.

5. 아동 개인정보 보호 (COPPA 준수)
본 앱은 영유아 교육을 목적으로 합니다. 아동의 개인정보를 수집하지 않으며, 계정 생성이나 로그인이 필요하지 않습니다. 아동의 정보가 외부로 유출되지 않습니다.

6. 광고
본 앱은 Google AdMob을 통해 보상형 광고를 표시할 수 있습니다. 광고는 아동 대상 설정(COPPA)에 따라 개인화되지 않은 광고만 표시됩니다. 광고 시청은 사용자가 직접 선택한 경우에만 표시됩니다.

7. 인앱 구매
프리미엄 영구 구매(Lifetime Pass) 및 AI 크레딧 팩이 제공됩니다. 구독 상품은 없습니다. 결제는 Apple App Store 또는 Google Play Store를 통해 안전하게 처리되며, 결제 정보는 본 앱에서 수집하지 않습니다.

8. 제3자 SDK
- Google AdMob: 보상형 광고 표시 (비개인화 광고만)
- Apple StoreKit / Google Play Billing: 인앱 구매 처리
- ElevenLabs API: AI 음성 생성 (텍스트를 음성으로 변환)

9. 변경 사항
본 방침이 변경될 경우 앱 업데이트를 통해 안내합니다.

10. 문의
개인정보 관련 문의사항이 있으시면 앱스토어 리뷰 또는 개발자 연락처로 문의해 주세요.`,

  en: `Word Card App Privacy Policy

Last updated: April 2026

1. Information We Collect
This app can record audio through your device's microphone. All recordings are stored locally on your device only and are never sent to any external server.
Images selected from your photo album are also stored locally only.
When using the AI voice feature, text data is sent to the ElevenLabs API to generate speech. The generated AI audio files are stored only on your device.

2. How We Use Information
Recorded audio is used solely for playing pronunciation on word cards. Parents can record their own voice to play for their child.
The AI voice feature generates pronunciation in 8 languages (Korean, English, Japanese, Spanish, Chinese, French, German, Portuguese).

3. Data Storage
- Mobile: Device internal storage (deleted when app is uninstalled)
- Web: Browser IndexedDB (deleted when browser data is cleared)
Voice recordings and photos are never stored on or transmitted to external servers. When generating AI voice, only text data is sent to ElevenLabs servers; the resulting audio files are stored only on your device.

4. Data Deletion
You can delete recordings, AI audio, photos, and custom cards through Settings > Data Manager. Individual card recordings and AI audio can be deleted from each card's edit screen.

5. Children's Privacy (COPPA Compliance)
This app is designed for early childhood education. We do not collect any personal information from children. No account creation or login is required. No child data is exposed externally.

6. Advertising
This app may display rewarded ads through Google AdMob. Ads are shown only when the user explicitly chooses to watch them. In compliance with COPPA, only non-personalized ads are served.

7. In-App Purchases
A Lifetime Pass (one-time purchase) and AI credit packs are available. There are no subscriptions. Payments are processed securely through Apple App Store or Google Play Store. No payment information is collected by this app.

8. Third-Party SDKs
- Google AdMob: Rewarded ad display (non-personalized ads only)
- Apple StoreKit / Google Play Billing: In-app purchase processing
- ElevenLabs API: AI voice generation (text-to-speech)

9. Changes
Any changes to this policy will be communicated through app updates.

10. Contact
For privacy-related inquiries, please reach out through the app store review or developer contact.`,

  ja: `単語カード アプリ プライバシーポリシー

最終更新日: 2026年4月

1. 収集する情報
本アプリはデバイスのマイクを通じて音声を録音できます。録音された音声はデバイス内部にのみ保存され、外部サーバーに送信されることはありません。
フォトアルバムから選択した画像もデバイス内部にのみ保存されます。
AI音声機能を使用する場合、テキストデータがElevenLabs APIに送信され音声が生成されます。生成されたAI音声ファイルはデバイス内部にのみ保存されます。

2. 情報の使用目的
録音された音声は、単語カードの発音再生にのみ使用されます。保護者が自分の声を録音してお子様に聞かせることができます。
AI音声機能は8言語（韓国語、英語、日本語、スペイン語、中国語、フランス語、ドイツ語、ポルトガル語）で発音を生成します。

3. 情報の保存
- モバイル: デバイス内部ストレージ（アプリ削除時に削除）
- Web: ブラウザIndexedDB（ブラウザデータ削除時に削除）
音声録音や写真は外部サーバーに保存・送信されません。AI音声生成時はテキストデータのみがElevenLabsサーバーに送信され、生成された音声ファイルはデバイスにのみ保存されます。

4. 情報の削除
設定 > データ管理から録音、AI音声、写真、カスタムカードを削除できます。個別のカードの録音やAI音声は各カードの編集画面から削除できます。

5. お子様のプライバシー（COPPA準拠）
本アプリは幼児教育を目的としています。お子様の個人情報を収集しません。アカウント作成やログインは不要です。

6. 広告
Google AdMobを通じてリワード広告を表示することがあります。COPPAに準拠し、パーソナライズされていない広告のみ表示されます。広告はユーザーが選択した場合のみ表示されます。

7. アプリ内購入
プレミアム永久購入（Lifetime Pass）およびAIクレジットパックがあります。サブスクリプションはありません。決済はApple App StoreまたはGoogle Play Storeを通じて安全に処理されます。決済情報は本アプリでは収集しません。

8. サードパーティSDK
- Google AdMob: リワード広告表示（非パーソナライズ広告のみ）
- Apple StoreKit / Google Play Billing: アプリ内購入処理
- ElevenLabs API: AI音声生成（テキスト読み上げ）

9. 変更事項
本ポリシーの変更はアプリのアップデートを通じてお知らせします。

10. お問い合わせ
プライバシーに関するお問い合わせは、アプリストアのレビューまたは開発者連絡先までご連絡ください。`,

  es: `Política de Privacidad de la App Tarjeta de Palabras

Última actualización: abril de 2026

1. Información que recopilamos
Esta app puede grabar audio a través del micrófono de su dispositivo. Todas las grabaciones se almacenan localmente en su dispositivo y nunca se envían a ningún servidor externo.
Las imágenes seleccionadas de su álbum de fotos también se almacenan solo localmente.
Al usar la función de voz IA, se envían datos de texto a la API de ElevenLabs para generar voz. Los archivos de audio IA generados se almacenan solo en su dispositivo.

2. Cómo usamos la información
El audio grabado se usa únicamente para reproducir la pronunciación en las tarjetas de palabras. Los padres pueden grabar su propia voz para reproducirla a sus hijos.
La función de voz IA genera pronunciación en 8 idiomas (coreano, inglés, japonés, español, chino, francés, alemán, portugués).

3. Almacenamiento de datos
- Móvil: Almacenamiento interno del dispositivo (se elimina al desinstalar la app)
- Web: IndexedDB del navegador (se elimina al borrar datos del navegador)
Las grabaciones de voz y fotos nunca se almacenan ni transmiten a servidores externos. Al generar voz IA, solo se envían datos de texto a los servidores de ElevenLabs; los archivos de audio resultantes se almacenan solo en su dispositivo.

4. Eliminación de datos
Puede eliminar grabaciones, audio IA, fotos y tarjetas personalizadas en Ajustes > Gestión de datos. Las grabaciones y audio IA individuales se pueden eliminar desde la pantalla de edición de cada tarjeta.

5. Privacidad infantil (Cumplimiento COPPA)
Esta app está diseñada para la educación infantil temprana. No recopilamos información personal de niños. No se requiere creación de cuenta ni inicio de sesión.

6. Publicidad
Esta app puede mostrar anuncios con recompensa a través de Google AdMob. Solo se muestran anuncios no personalizados, cumpliendo con COPPA. Los anuncios solo se muestran cuando el usuario elige verlos.

7. Compras dentro de la app
Se ofrece una compra premium permanente (Lifetime Pass) y paquetes de créditos IA. No hay suscripciones. Los pagos se procesan de forma segura a través de Apple App Store o Google Play Store. Esta app no recopila información de pago.

8. SDKs de terceros
- Google AdMob: Anuncios con recompensa (solo no personalizados)
- Apple StoreKit / Google Play Billing: Procesamiento de compras
- ElevenLabs API: Generación de voz IA (texto a voz)

9. Cambios
Los cambios en esta política se comunicarán a través de actualizaciones de la app.

10. Contacto
Para consultas sobre privacidad, comuníquese a través de la reseña de la tienda de apps o el contacto del desarrollador.`,

  zh: `单词卡片应用隐私政策

最后更新日期：2026年4月

1. 我们收集的信息
本应用可以通过设备麦克风录制音频。所有录音仅存储在您的设备本地，不会发送到任何外部服务器。
从相册选择的图片也仅存储在本地。
使用AI语音功能时，文本数据会发送至ElevenLabs API以生成语音。生成的AI音频文件仅存储在您的设备上。

2. 信息使用方式
录制的音频仅用于单词卡片的发音播放。家长可以录制自己的声音播放给孩子听。
AI语音功能支持8种语言（韩语、英语、日语、西班牙语、中文、法语、德语、葡萄牙语）生成发音。

3. 数据存储
- 移动端：设备内部存储（卸载应用时删除）
- 网页端：浏览器IndexedDB（清除浏览器数据时删除）
语音录音和照片不会存储或传输至外部服务器。生成AI语音时，仅文本数据发送至ElevenLabs服务器；生成的音频文件仅存储在您的设备上。

4. 数据删除
您可以通过设置 > 数据管理删除录音、AI音频、照片和自定义卡片。单个卡片的录音和AI音频可以从每张卡片的编辑界面中删除。

5. 儿童隐私（COPPA合规）
本应用面向幼儿教育。我们不收集任何儿童个人信息。无需创建账户或登录。

6. 广告
本应用可能通过Google AdMob展示激励广告。遵循COPPA规定，仅展示非个性化广告。广告仅在用户主动选择观看时展示。

7. 应用内购买
提供高级版永久购买（Lifetime Pass）和AI积分包。没有订阅项目。付款通过Apple App Store或Google Play Store安全处理。本应用不收集任何付款信息。

8. 第三方SDK
- Google AdMob：激励广告展示（仅非个性化广告）
- Apple StoreKit / Google Play Billing：应用内购买处理
- ElevenLabs API：AI语音生成（文本转语音）

9. 变更
本政策的任何变更将通过应用更新通知。

10. 联系方式
如有隐私相关问题，请通过应用商店评论或开发者联系方式联系我们。`,

  fr: `Politique de confidentialité de l'application Carte de Mots

Dernière mise à jour : avril 2026

1. Informations collectées
Cette application peut enregistrer de l'audio via le microphone de votre appareil. Tous les enregistrements sont stockés uniquement sur votre appareil et ne sont jamais envoyés à un serveur externe.
Les images sélectionnées depuis votre album photo sont également stockées uniquement en local.
Lors de l'utilisation de la fonction vocale IA, des données textuelles sont envoyées à l'API ElevenLabs pour générer la parole. Les fichiers audio IA générés sont stockés uniquement sur votre appareil.

2. Utilisation des informations
L'audio enregistré est utilisé uniquement pour la lecture de la prononciation sur les cartes de mots. Les parents peuvent enregistrer leur propre voix pour la faire écouter à leur enfant.
La fonction vocale IA génère la prononciation dans 8 langues (coréen, anglais, japonais, espagnol, chinois, français, allemand, portugais).

3. Stockage des données
- Mobile : Stockage interne de l'appareil (supprimé lors de la désinstallation)
- Web : IndexedDB du navigateur (supprimé lors de l'effacement des données)
Les enregistrements vocaux et photos ne sont jamais stockés ou transmis à des serveurs externes. Lors de la génération vocale IA, seules les données textuelles sont envoyées aux serveurs ElevenLabs ; les fichiers audio résultants sont stockés uniquement sur votre appareil.

4. Suppression des données
Vous pouvez supprimer les enregistrements, l'audio IA, les photos et les cartes personnalisées dans Paramètres > Gestion des données. Les enregistrements et l'audio IA individuels peuvent être supprimés depuis l'écran d'édition de chaque carte.

5. Vie privée des enfants (Conformité COPPA)
Cette application est conçue pour l'éducation de la petite enfance. Nous ne collectons aucune information personnelle des enfants. Aucune création de compte ni connexion n'est requise.

6. Publicité
Cette application peut afficher des publicités récompensées via Google AdMob. Conformément à la COPPA, seules des publicités non personnalisées sont diffusées. Les publicités ne s'affichent que lorsque l'utilisateur choisit de les regarder.

7. Achats intégrés
Un achat premium permanent (Lifetime Pass) et des packs de crédits IA sont disponibles. Il n'y a pas d'abonnement. Les paiements sont traités de manière sécurisée via l'Apple App Store ou le Google Play Store. Cette application ne collecte aucune information de paiement.

8. SDK tiers
- Google AdMob : Publicités récompensées (non personnalisées uniquement)
- Apple StoreKit / Google Play Billing : Traitement des achats
- ElevenLabs API : Génération vocale IA (synthèse vocale)

9. Modifications
Toute modification de cette politique sera communiquée via les mises à jour de l'application.

10. Contact
Pour toute question relative à la vie privée, veuillez nous contacter via l'avis de l'App Store ou le contact du développeur.`,

  de: `Datenschutzrichtlinie der Wortkarte-App

Letzte Aktualisierung: April 2026

1. Erfasste Informationen
Diese App kann Audio über das Mikrofon Ihres Geräts aufnehmen. Alle Aufnahmen werden nur lokal auf Ihrem Gerät gespeichert und niemals an externe Server gesendet.
Aus dem Fotoalbum ausgewählte Bilder werden ebenfalls nur lokal gespeichert.
Bei Nutzung der KI-Sprachfunktion werden Textdaten an die ElevenLabs-API gesendet, um Sprache zu erzeugen. Die erzeugten KI-Audiodateien werden nur auf Ihrem Gerät gespeichert.

2. Verwendung der Informationen
Aufgenommenes Audio wird ausschließlich für die Aussprache-Wiedergabe auf Wortkarten verwendet. Eltern können ihre eigene Stimme aufnehmen, um sie ihrem Kind vorzuspielen.
Die KI-Sprachfunktion erzeugt Aussprache in 8 Sprachen (Koreanisch, Englisch, Japanisch, Spanisch, Chinesisch, Französisch, Deutsch, Portugiesisch).

3. Datenspeicherung
- Mobil: Interner Gerätespeicher (wird bei App-Deinstallation gelöscht)
- Web: Browser-IndexedDB (wird beim Löschen der Browserdaten gelöscht)
Sprachaufnahmen und Fotos werden niemals auf externen Servern gespeichert oder übertragen. Bei der KI-Sprachgenerierung werden nur Textdaten an ElevenLabs-Server gesendet; die resultierenden Audiodateien werden nur auf Ihrem Gerät gespeichert.

4. Datenlöschung
Sie können Aufnahmen, KI-Audio, Fotos und benutzerdefinierte Karten unter Einstellungen > Datenverwaltung löschen. Einzelne Aufnahmen und KI-Audio können über den Bearbeitungsbildschirm jeder Karte gelöscht werden.

5. Datenschutz für Kinder (COPPA-Konformität)
Diese App dient der frühkindlichen Bildung. Wir erfassen keine persönlichen Informationen von Kindern. Keine Kontoerstellung oder Anmeldung erforderlich.

6. Werbung
Diese App kann Belohnungswerbung über Google AdMob anzeigen. Gemäß COPPA werden nur nicht personalisierte Anzeigen geschaltet. Werbung wird nur angezeigt, wenn der Benutzer sich aktiv dafür entscheidet.

7. In-App-Käufe
Ein dauerhafter Premium-Kauf (Lifetime Pass) und KI-Kredit-Pakete sind verfügbar. Es gibt keine Abonnements. Zahlungen werden sicher über den Apple App Store oder Google Play Store abgewickelt. Diese App erfasst keine Zahlungsinformationen.

8. Drittanbieter-SDKs
- Google AdMob: Belohnungswerbung (nur nicht personalisiert)
- Apple StoreKit / Google Play Billing: In-App-Kauf-Verarbeitung
- ElevenLabs API: KI-Sprachgenerierung (Text-to-Speech)

9. Änderungen
Änderungen an dieser Richtlinie werden über App-Updates mitgeteilt.

10. Kontakt
Bei datenschutzbezogenen Anfragen kontaktieren Sie uns bitte über die App-Store-Bewertung oder den Entwicklerkontakt.`,

  pt: `Política de Privacidade do App Cartão de Palavras

Última atualização: abril de 2026

1. Informações que coletamos
Este app pode gravar áudio através do microfone do seu dispositivo. Todas as gravações são armazenadas apenas localmente no seu dispositivo e nunca são enviadas para qualquer servidor externo.
Imagens selecionadas do seu álbum de fotos também são armazenadas apenas localmente.
Ao usar o recurso de voz IA, dados de texto são enviados à API da ElevenLabs para gerar fala. Os arquivos de áudio IA gerados são armazenados apenas no seu dispositivo.

2. Como usamos as informações
O áudio gravado é usado exclusivamente para reproduzir a pronúncia nos cartões de palavras. Os pais podem gravar sua própria voz para reproduzir para seus filhos.
O recurso de voz IA gera pronúncia em 8 idiomas (coreano, inglês, japonês, espanhol, chinês, francês, alemão, português).

3. Armazenamento de dados
- Móvel: Armazenamento interno do dispositivo (excluído ao desinstalar o app)
- Web: IndexedDB do navegador (excluído ao limpar dados do navegador)
Gravações de voz e fotos nunca são armazenadas ou transmitidas para servidores externos. Ao gerar voz IA, apenas dados de texto são enviados aos servidores da ElevenLabs; os arquivos de áudio resultantes são armazenados apenas no seu dispositivo.

4. Exclusão de dados
Você pode excluir gravações, áudio IA, fotos e cartões personalizados em Configurações > Gerenciador de dados. Gravações e áudio IA individuais podem ser excluídos na tela de edição de cada cartão.

5. Privacidade infantil (Conformidade COPPA)
Este app é projetado para educação infantil. Não coletamos informações pessoais de crianças. Não é necessária criação de conta ou login.

6. Publicidade
Este app pode exibir anúncios com recompensa através do Google AdMob. Em conformidade com a COPPA, apenas anúncios não personalizados são exibidos. Os anúncios são mostrados apenas quando o usuário escolhe assisti-los.

7. Compras no app
Uma compra premium permanente (Lifetime Pass) e pacotes de créditos IA estão disponíveis. Não há assinaturas. Os pagamentos são processados com segurança através da Apple App Store ou Google Play Store. Este app não coleta informações de pagamento.

8. SDKs de terceiros
- Google AdMob: Exibição de anúncios com recompensa (apenas não personalizados)
- Apple StoreKit / Google Play Billing: Processamento de compras
- ElevenLabs API: Geração de voz IA (texto para fala)

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

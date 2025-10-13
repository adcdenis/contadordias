import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded p-6">
      <h1 className="text-3xl font-bold mb-4">Política de Privacidade</h1>
      <p className="text-gray-700 mb-4">
        A sua privacidade é de extrema importância para nós. Esta Política de Privacidade descreve como o nosso aplicativo coleta, usa e protege as suas informações pessoais. Ao utilizar o nosso aplicativo, você concorda com a coleta e uso de informações de acordo com esta política.
      </p>

      <h2 className="text-xl font-semibold mb-2">1. Informações que Coletamos</h2>
      <p className="text-gray-700 mb-4">
        O nosso aplicativo adota uma abordagem minimalista para a coleta de dados, solicitando apenas as informações essenciais necessárias para o seu funcionamento e para fornecer-lhe uma experiência de usuário personalizada.
      </p>
      <p className="text-gray-700 mb-4">
        <strong>Informações de Identificação Pessoal (IIP):</strong> Coletamos e armazenamos apenas o seu nome e endereço de e-mail. Essas informações são fornecidas diretamente por você durante o processo de registro ou uso do aplicativo.
      </p>

      <h2 className="text-xl font-semibold mb-2">2. Uso das Suas Informações</h2>
      <p className="text-gray-700 mb-2">As informações coletadas são utilizadas exclusivamente para os seguintes propósitos:</p>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li><strong>Identificação e Acesso:</strong> O seu nome e e-mail são usados para criar e gerenciar a sua conta, permitindo o seu acesso ao aplicativo.</li>
        <li><strong>Comunicação:</strong> O seu e-mail pode ser usado para enviar informações importantes relacionadas à sua conta, como redefinição de senha, notificações de serviço ou informações essenciais sobre o aplicativo.</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">3. Confidencialidade e Sigilo</h2>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li><strong>Armazenamento Seguro:</strong> Todas as suas informações são armazenadas em servidores seguros, com medidas de segurança técnicas e organizacionais adequadas para proteger contra acesso não autorizado, divulgação, alteração ou destruição.</li>
        <li><strong>Restrição de Acesso:</strong> O acesso às suas informações pessoais é estritamente limitado aos membros da nossa equipe que necessitam delas para operar, desenvolver ou melhorar o aplicativo.</li>
        <li><strong>Não Compartilhamento:</strong> Não vendemos, trocamos ou transferimos as suas informações de identificação pessoal para terceiros. Seus dados são mantidos em absoluto sigilo e não serão divulgados, exceto quando exigido por lei.</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">4. Retenção de Dados</h2>
      <p className="text-gray-700 mb-4">
        Manteremos as suas Informações de Identificação Pessoal apenas pelo tempo necessário para os fins estabelecidos nesta Política de Privacidade e para cumprir com as nossas obrigações legais.
      </p>

      <h2 className="text-xl font-semibold mb-2">5. Seus Direitos</h2>
      <p className="text-gray-700 mb-2">Você tem o direito de:</p>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li><strong>Acessar</strong> os seus dados pessoais que mantemos.</li>
        <li><strong>Solicitar a correção</strong> de quaisquer dados incorretos ou incompletos.</li>
        <li><strong>Solicitar a exclusão</strong> dos seus dados pessoais ("direito de ser esquecido"), o que implicará no encerramento da sua conta no aplicativo.</li>
      </ul>
      <p className="text-gray-700 mb-4">
        Para exercer qualquer um desses direitos, entre em contato conosco através do e-mail de suporte fornecido no aplicativo.
      </p>

      <h2 className="text-xl font-semibold mb-2">6. Alterações a Esta Política de Privacidade</h2>
      <p className="text-gray-700 mb-4">
        Podemos atualizar a nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página e, quando apropriado, por meio de uma notificação clara dentro do aplicativo ou por e-mail. Aconselhamos a revisar esta Política de Privacidade periodicamente para quaisquer alterações.
      </p>

      <h2 className="text-xl font-semibold mb-2">Contato</h2>
      <p className="text-gray-700 mb-1">
        Se tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco através do nosso e-mail de suporte:
      </p>
      <p className="text-gray-700"><a href="mailto:adcdenis@gmail.com" className="text-blue-600 hover:underline">adcdenis@gmail.com</a></p>
    </div>
  );
};

export default PrivacyPolicy;
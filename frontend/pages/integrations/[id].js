import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import NavHeader from "~/components/navigation/NavHeader";
import Integration from "~/components/integrations/Integration";
import FrameworkIntegration from "~/components/integrations/FrameworkIntegration";
import CloudIntegration from "~/components/integrations/CloudIntegration";
import guidGenerator from "~/utilities/randomId";
import { 
  frameworks
} from "../../public/data/frequentConstants";
import deleteIntegrationAuth from "../api/integrations/DeleteIntegrationAuth";
import getIntegrations from "../api/integrations/GetIntegrations";
import getWorkspaceAuthorizations from "../api/integrations/getWorkspaceAuthorizations";
import getWorkspaceIntegrations from "../api/integrations/getWorkspaceIntegrations";
import getBot from "../api/bot/getBot";
import setBotActiveStatus from "../api/bot/setBotActiveStatus";
import getLatestFileKey from "../api/workspace/getLatestFileKey";
import ActivateBotDialog from "~/components/basic/dialog/ActivateBotDialog";
const {
  decryptAssymmetric,
  encryptAssymmetric
} = require('../../components/utilities/cryptography/crypto');
const crypto = require("crypto");

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [projectIntegrations, setProjectIntegrations] = useState([]);
  const [authorizations, setAuthorizations] = useState();
  const [bot, setBot] = useState(null);
  const [isActivateBotOpen, setIsActivateBotOpen] = useState(false);
  const [selectedIntegrationOption, setSelectedIntegrationOption] = useState(null); 

  const router = useRouter();

  useEffect(async () => {
    try {
      // get integrations authorized for project
      let projectAuthorizations = await getWorkspaceAuthorizations({
        workspaceId: router.query.id,
      });
      setAuthorizations(projectAuthorizations);

      // get active/inactive (cloud) integrations for project
      const projectIntegrations = await getWorkspaceIntegrations({
        workspaceId: router.query.id,
      });
      setProjectIntegrations(projectIntegrations);
      
      // get bot for project
      const bot = await getBot({
        workspaceId: router.query.id
      });
      setBot(bot.bot);

      // get cloud integration options
      let integrationOptions = await getIntegrations();
      integrationOptions = Object
        .keys(integrationOptions)
        .map(integrationOption => integrationOptions[integrationOption]);
      
      setIntegrations(integrationOptions);
    } catch (err) {
      console.log(err);
    }
  }, []);

  /**
   * Activate bot for project by performing the following steps:
   * 1. Get the (encrypted) project key
   * 2. Decrypt project key with user's private key
   * 3. Encrypt project key with bot's public key
   * 4. Send encrypted project key to backend and set bot status to active
   */
  const handleBotActivate = async () => {
    try {
      const key = await getLatestFileKey({ workspaceId: router.query.id });

      if (bot) {
        // case: there is a bot
          const PRIVATE_KEY = localStorage.getItem('PRIVATE_KEY');
          
          const WORKSPACE_KEY = decryptAssymmetric({
            ciphertext: key.latestKey.encryptedKey,
            nonce: key.latestKey.nonce,
            publicKey: key.latestKey.sender.publicKey,
            privateKey: PRIVATE_KEY
          });

          const { ciphertext, nonce } = encryptAssymmetric({
            plaintext: WORKSPACE_KEY,
            publicKey: bot.publicKey,
            privateKey: PRIVATE_KEY
          });

          botKey = {
            encryptedKey: ciphertext,
            nonce
          }
          
          // case: bot is not active
          setBot((await setBotActiveStatus({
            botId: bot._id,
            isActive: bot.isActive ? false : true,
            botKey
          })).bot);
        }
    } catch (err) {
      console.error(err);
    }
  }
  
  /**
   * Start integration for a given integration option [integrationOption]
   * @param {Object} obj 
   * @param {Object} obj.integrationOption - an integration option
   * @returns 
   */
  const handleIntegrationOption = async ({ integrationOption }) => {
    // TODO: modularize
    
    // generate CSRF token for OAuth2 code-token exchange integrations
    const csrfToken = crypto.randomBytes(16).toString("hex");
    
    switch (integrationOption.name) {
      case 'Heroku':
        window.location = `https://id.heroku.com/oauth/authorize?client_id=7b1311a1-1cb2-4938-8adf-f37a399ec41b&response_type=code&scope=write-protected&state=${csrfToken}`;
        return;
    }
    
  }

  /**
   * Call [handleIntegrationOption] if bot is active, else open dialog for user to grant
   * permission to share secretes with Infisical prior to starting any integration
   * @param {Object} obj 
   * @param {String} obj.integrationOption - an integration option
   * @returns 
   */
  const integrationOptionPress = ({ integrationOption }) => {
    try {
      if (bot.isActive) {
        // case: bot is active -> proceed with integration
        handleIntegrationOption({ integrationOption });
        return;
      }
      
      // case: bot is not active -> open modal to activate bot
      setIsActivateBotOpen(true);
    } catch (err) {
      console.error(err);
    }
  }
  
  return integrations ? (
    <div className="bg-bunker-800 max-h-screen flex flex-col justify-between text-white">
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/infisical.ico" />
        <meta property="og:image" content="/images/message.png" />
        <meta property="og:title" content="Manage your .env files in seconds" />
        <meta
          name="og:description"
          content="Infisical a simple end-to-end encrypted platform that enables teams to sync and manage their .env files."
        />
      </Head>
      <div className="w-full max-h-96 pb-2 h-screen max-h-[calc(100vh-10px)] overflow-y-scroll no-scrollbar no-scrollbar::-webkit-scrollbar">
        <NavHeader pageName="Project Integrations" isProjectRelated={true} />
        <ActivateBotDialog 
          isOpen={isActivateBotOpen}
          closeModal={() => setIsActivateBotOpen(false)}
          selectedIntegrationOption={selectedIntegrationOption}
          handleBotActivate={handleBotActivate}
          handleIntegrationOption={handleIntegrationOption}
        />
        {projectIntegrations.length > 0 && (
          <>
            <div className="flex flex-col justify-between items-start mx-4 mb-4 mt-6 text-xl max-w-5xl px-2">
              <p className="font-semibold text-3xl">Current Project Integrations</p>
              <p className="text-base text-gray-400">
                Manage your integrations of Infisical with third-party services.
              </p>
            </div>
            {projectIntegrations.map((projectIntegration) => (
              <Integration
                key={guidGenerator()}
                projectIntegration={projectIntegration}
              />
            ))}
          </>
        )}
        <div className={`flex flex-col justify-between items-start m-4 ${projectIntegrations.length > 0 ? 'mt-12' : 'mt-6'} text-xl max-w-5xl px-2`}>
          <p className="font-semibold text-3xl">Cloud Integrations</p>
          <p className="text-base text-gray-400">
            Click on an integration to begin syncing secrets to it.
          </p>
        </div>
        <div className="grid gap-4 grid-cols-4 grid-rows-2 mx-6 max-w-5xl">
          {integrations.map((integration) => (
            <CloudIntegration 
              integration={integration}
              setSelectedIntegrationOption={setSelectedIntegrationOption}
              integrationOptionPress={integrationOptionPress}
              deleteIntegrationAuth={deleteIntegrationAuth}
              authorizations={authorizations}
            />
          ))}
        </div>
        <div className="flex flex-col justify-between items-start mx-4 mt-12 mb-4 text-xl max-w-5xl px-2">
          <p className="font-semibold text-3xl">Framework Integrations</p>
          <p className="text-base text-gray-400">
            Click on a framework to get the setup instructions.
          </p>
        </div>
        <div className="grid gap-4 grid-cols-7 grid-rows-2 mx-6 mt-4 max-w-5xl">
          {frameworks.map((framework) => (
            <FrameworkIntegration framework={framework} />
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className="relative z-10 w-10/12 mr-auto h-full ml-2 bg-bunker-800 flex flex-col items-center justify-center">
      <div className="absolute top-0 bg-bunker h-14 border-b border-mineshaft-700 w-full"></div>
      <Image
        src="/images/loading/loading.gif"
        height={70}
        width={120}
        alt="loading animation"
      ></Image>
    </div>
  );
}

Integrations.requireAuth = true;

const ENV = {
    qa: false
};

const apiDomains = {
    qa: "hc1n.dev.lprnd.net",
    prod: "api.liveperson.net"
};

const entries = {
    "liveEngage": {
        name: "LiveEngage",
        description: "LiveEngage allows large brands with millions of consumers implement digital transformation at scale.",
        type: "csds",
    },
    "coBrowse": {
        name: "coBrowse",
        description: "Screenshare to solve problems and demonstrate a more hands-on approach to customer service.",
        type: "csds"
    },
    "coApp": {
        name: "coApp",
        description: "CoApp makes your mobile messaging conversations more interactive with co-browse, digital voice or digital video.",
        type: "csds"
    },
    "leBackofficeInt": {
        name: "Houston",
        description: "Mission Control for LiveEngage with lots of modules for customizing account configuration and features.",
        type: "csds"
    },
    "mcs": {
        name: "MCS Toolkit",
        description: "Meaningful Connector Score measures the sentiment conversations and changes outcome for the better.",
        type: "csds"
    },
    "rtDashboard": {
        name: "Real-time Dashboard",
        description: "Customer care professionals and admins can see their daily operational KPI metrics updated in real time.",
        type: "csds"
    },
    "routingBot": {
        name: "Bot Studio",
        description: "Configure Routing Bots and Post Conversation Surveys in a sleak UI outside of LiveEngage.",
        type: "csds"
    },
    "faasUI": {
        name: "Function-as-a-Service",
        description: "Use FaaS to execute custom logic in response to platform events and tailor LiveEngage to your needs.",
        type: "csds"
    },
    "transporter": {
        name: "Transporter",
        description: "Provides brands with a simple way to integrate LiveEngage data & open platform APIs.",
        type: "csds"
    }
};

const config = {
    csds: {},
    servicepath: "a/~~accountid~~/#,~~ssokey~~",
    apiDomain: () => ENV.qa ? apiDomains.qa : apiDomains.prod
};

const urls = {
    api: (account) => `https://${config.apiDomain()}/csdr/account/${account}/service/baseURI.lpCsds?version=1.0`,
    service: (account, domain, ssoKey) => `https://${domain}/a/${account}/#,${ssoKey}`
};

const ssoForm = document.forms.sso,
    accountInput = ssoForm.account,
    userInput = ssoForm.user,
    passInput = ssoForm.pass;



accountInput.addEventListener("blur", (event) => {
    const account = event.target.value;
    ENV.qa = /^(qa|le)/.test(account);
    console.log("ENVIRONMENT QA: ", ENV.qa);
});

ssoForm.addEventListener("submit", event => {
    console.log("Form submitted");

    const account = accountInput.value,
        user = userInput.value,
        pass = passInput.value;

    console.log("API ", urls.api(account));
    fetch(urls.api(account))
        .then(response => response.text())
        .then(text => {
            console.log("TEXT ", text);

            const json = JSON.parse(text.substring(text.indexOf('(') + 1, text.indexOf(')')));
            console.log("JSON ", json);

            const uris = json.ResultSet.lpData.baseURIs;
            uris.forEach((entry) => {
                config.csds[entry.service] = entry.baseURI;
            });


            Object.keys(entries).forEach((key) => {
                let entry = entries[key];

                if (entry.type == "csds") {
                    creatCsdsTile(account, user, pass, key, entry);
                }
            });



        });

    event.preventDefault();
    return false;
});



const creatCsdsTile = (account, user, pass, service, entry) => {
    const a = createEl(document.body, "div", {
        innerHTML: `<h2>${entry.name}</h2><p>${entry.description}</p>`,
        class: "card card-1"
    });

    a.addEventListener("click", (event) => {
        startLogin(account, user, pass, service);
        event.preventDefault();
        return false;
    });
}

const startLogin = (account, user, pass, service) => {

    form = createEl(document.body, "form", {
        method: "post",
        action: `https://${config.csds.adminArea}/hc/s-${account}/web/m-LP/mlogin/home.jsp`,
        target: "_blank"
    });

    createEl(form, "input", {
        type: "hidden",
        name: "site",
        value: account
    });

    createEl(form, "input", {
        type: "hidden",
        name: "user",
        value: user
    });

    createEl(form, "input", {
        type: "hidden",
        name: "pass",
        value: pass
    });


    createEl(form, "input", {
        type: "hidden",
        name: "servicepath",
        value: config.servicepath
    });


    createEl(form, "input", {
        type: "hidden",
        name: "lpservice",
        value: service
    });

    form.submit();

    window.focus();

};


// HTML helper 1999 style
const createEl = (parent, name, attrs) => {
    const el = document.createElement(name);
    if (attrs) {
        Object.keys(attrs).forEach(key => {
            if (key == "innerHTML") {
                el.innerHTML = attrs.innerHTML;
            } else {
                el.setAttribute(key, attrs[key]);
            }
        });
    }

    return parent.appendChild(el);
};


import Card from "../../components/Card";

const AboutPage = () => {
  return /*html*/ `
    <body>
      <div class="container">
        <h1>About Stone Throw</h1>

        <div class="section">
          <h2>Framework Philosophy</h2>
          ${Card(
            { title: "Our Approach" },
            /*html*/ `
            <div>
              <p>
                Stone Throw is a lightweight web component framework focused on:
              </p>
            </div>`
          )}
        </div>

        <div class="section">
          <a href="/">Return to Home</a>
        </div>
      </div>
    </body>
  `;
};

export default AboutPage;

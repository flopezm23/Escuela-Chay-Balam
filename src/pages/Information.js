import React from "react";
import "./Information.css";

const Information = () => {
  return (
    <div className="information-container">
      <div className="info-header">
        <h1>Información Institucional</h1>
        <p>Escuela Oficial Urbana Mixta Cantonal Bilingüe Chay B'alam</p>
        <p>San Andrés Iztapa, Chimaltenango</p>
      </div>

      <div className="information-image">
        <img src="/LogoEscuela.jpg" alt="Logo Chay B'alam" />
      </div>

      <div className="info-sections">
        <section className="info-section">
          <h2>Misión</h2>
          <p>
            Somos una comunidad Educativa que facilita educación de calidad, que
            motiva a sus estudiantes para desarrollar actitudes de éxito ante la
            vida y el trabajo. Privilegiamos el trabajo en equipo con padres de
            familia, autoridades comunitarias y alumnado. Trabajamos en común
            para brindar un ambiente agradable para el proceso enseñanza
            aprendizaje de las niñas y niños. Desarrollamos un currículo
            planificado en conjunto con la comunidad educativa, por lo que
            responde a sus necesidades y aspiraciones.
          </p>
        </section>

        <section className="info-section">
          <h2>Visión</h2>
          <p>
            Ser una escuela exitosa, que ofrece servicios educativos de calidad
            a la población que atiende facilitando una educación para la vida,
            la dignidad, el desarrollo de habilidades, capacidades y actitudes
            positivas ante la vida con principios y valores humanos en un
            ambiente educativo apropiado. Formamos en la cultura e idioma
            comunitario, el Kaqchikel, el idioma de interrelación nacional, el
            castellano y un idioma extranjero. Contribuimos a la construcción de
            una ciudadanía intercultural para una mejor Guatemala.
          </p>
        </section>

        <section className="info-section">
          <h2>Valores Institucionales</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Respeto</h3>
            </div>
            <div className="value-card">
              <h3>Compañerismo</h3>
            </div>
            <div className="value-card">
              <h3>Empatía</h3>
            </div>
            <div className="value-card">
              <h3>Tolerancia</h3>
            </div>
            <div className="value-card">
              <h3>Igualdad</h3>
            </div>
            <div className="value-card">
              <h3>Amor a la patria</h3>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h2>Historia</h2>
          <p>
            La Escuela Oficial Urbana Mixta Cantonal Bilingüe Chay B'alam fue
            fundada en 1995 con el objetivo de brindar educación de calidad a la
            comunidad de San Andrés Iztapa. A lo largo de los años, hemos
            crecido y evolucionado, incorporando el programa bilingüe en 2005 y
            modernizando nuestras instalaciones y métodos de enseñanza.
          </p>
          <p>
            El nombre "Chay B'alam" rinde homenaje a nuestras raíces mayas y
            significa "Jaguar de Obsidiana", simbolizando fortaleza, sabiduría y
            conexión con nuestra herencia cultural.
          </p>
        </section>

        <section className="info-section">
          <h2>Instalaciones</h2>
          <div className="facilities-grid">
            <div className="facility-item">
              <h3>🏫 Aulas Equipadas</h3>
              <p>18 aulas con tecnología educativa moderna</p>
            </div>
            <div className="facility-item">
              <h3>💻 Laboratorio de Computación</h3>
              <p>25 computadoras con acceso a internet</p>
            </div>
            <div className="facility-item">
              <h3>📚 Biblioteca</h3>
              <p>Más de 5,000 libros y recursos digitales</p>
            </div>
            <div className="facility-item">
              <h3>⚽ Cancha Deportiva</h3>
              <p>Espacio para educación física y actividades deportivas</p>
            </div>
            <div className="facility-item">
              <h3>🎭 Auditorio</h3>
              <p>Capacidad para 200 personas para eventos culturales</p>
            </div>
            <div className="facility-item">
              <h3>🌳 Áreas Verdes</h3>
              <p>Espacios recreativos y de esparcimiento</p>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h2>Programas Académicos</h2>
          <div className="programs-list">
            <div className="program-item">
              <h3>Educación Bilingüe</h3>
              <p>Programa integral español-inglés desde primer grado</p>
            </div>
            <div className="program-item">
              <h3>Tecnología Educativa</h3>
              <p>Incorporación de herramientas digitales en el aprendizaje</p>
            </div>
            <div className="program-item">
              <h3>Deportes y Cultura</h3>
              <p>Fútbol, básquetbol, música, danza y teatro</p>
            </div>
            <div className="program-item">
              <h3>Refuerzo Académico</h3>
              <p>Programas de apoyo para estudiantes que lo requieran</p>
            </div>
          </div>
        </section>

        <section className="info-section contact-section">
          <h2>Contacto</h2>
          <div className="contact-info">
            <p>
              <strong>Dirección:</strong> 5a calle, zona 1, San Andrés Iztapa,
              Chimaltenango
            </p>
            <p>
              <strong>Teléfono:</strong> (502) 1234-5678
            </p>
            <p>
              <strong>Email:</strong> info@chaybalam.edu.gt
            </p>
            <p>
              <strong>Horario de atención:</strong> Lunes a Viernes, 7:00 -
              17:00 horas
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Information;

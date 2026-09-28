import logging


def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    app_logger = logging.getLogger("app")
    app_logger.setLevel(logging.INFO)